const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');

const SITES_AVAILABLE = '/etc/nginx/sites-available';
const SITES_ENABLED = '/etc/nginx/sites-enabled';

const getTemplate = (domain) => {
    return `
server {
    listen 80;
    server_name ${domain};
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3000; # Assuming app runs on 3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`;
};

const configureDomain = async (domain) => {
    // 1. Write config file
    const configContent = getTemplate(domain);
    const availablePath = path.join(SITES_AVAILABLE, domain);

    console.log(`[NGINX] Writing config for ${domain}...`);

    // Use sudo tee to write file as root (since node process might not be root)
    // echo 'content' | sudo tee /path/to/file
    const writeCmd = `echo '${configContent.replace(/'/g, "'\\''")}' | sudo tee ${availablePath}`;

    await execCommand(writeCmd);
    console.log(`[NGINX] Config written to ${availablePath}`);

    // 2. Symlink
    const linkPath = path.join(SITES_ENABLED, domain);
    try {
        await execCommand(`sudo ln -sf ${availablePath} ${linkPath}`);
    } catch (err) {
        console.error(`[NGINX] Symlink warning:`, err.message);
    }

    // 3. Test Config
    await execCommand('sudo nginx -t');

    // 4. Reload NGINX
    await execCommand('sudo systemctl reload nginx');
    console.log(`[NGINX] Reloaded successfully for ${domain}`);
};

const removeDomain = async (domain) => {
    try {
        await fs.unlink(path.join(SITES_ENABLED, domain));
        await fs.unlink(path.join(SITES_AVAILABLE, domain));
        await execCommand('systemctl reload nginx');
    } catch (err) {
        console.error(`[NGINX] Error removing ${domain}:`, err);
    }
};

const execCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(stdout);
        });
    });
};

module.exports = {
    configureDomain,
    removeDomain
};
