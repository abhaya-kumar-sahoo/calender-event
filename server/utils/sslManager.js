const { exec } = require('child_process');
const path = require('path');
const Domain = require('../models/Domain');
const nginxManager = require('./nginxManager');

// Queue to process domains one by one to avoid Certbot locking issues
const processingQueue = [];
let isProcessing = false;

const processQueue = async () => {
    if (isProcessing || processingQueue.length === 0) return;

    isProcessing = true;
    const domainId = processingQueue.shift();

    try {
        await issueCertificate(domainId);
    } catch (err) {
        console.error(`Error processing SSL for domain ${domainId}:`, err);
    } finally {
        isProcessing = false;
        processQueue(); // Process next
    }
};

const provisionSSL = (domainId) => {
    processingQueue.push(domainId);
    processQueue();
};

const issueCertificate = async (domainId) => {
    const domainDoc = await Domain.findById(domainId);
    if (!domainDoc) return;

    console.log(`[SSL] Starting provisioning for ${domainDoc.domain}`);

    const scriptPath = path.join(__dirname, '../scripts/certbot/issue-cert.sh');
    const domain = domainDoc.domain;

    // Path to the hooks
    const authHook = path.join(__dirname, '../scripts/certbot/auth.sh');
    const cleanupHook = path.join(__dirname, '../scripts/certbot/cleanup.sh');

    // Command: certbot certonly --manual --preferred-challenges dns -d domain
    // We wrap this in our script
    const cmd = `${scriptPath} "${domain}" "${authHook}" "${cleanupHook}"`;

    return new Promise((resolve, reject) => {
        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.error(`[SSL] Certbot failed for ${domain}:`, stderr);
                domainDoc.sslStatus = 'failed';
                domainDoc.sslError = stderr || error.message;
                await domainDoc.save();
                resolve(); // We resolve even on error to continue queue
                return;
            }

            console.log(`[SSL] Certbot success for ${domain}`);

            // Cert issued. Now configure NGINX.
            try {
                await nginxManager.configureDomain(domain);
                domainDoc.sslStatus = 'issued';
                domainDoc.sslError = null;
                await domainDoc.save();
            } catch (nginxErr) {
                console.error(`[SSL] NGINX config failed for ${domain}:`, nginxErr);
                domainDoc.sslStatus = 'failed';
                domainDoc.sslError = `NGINX: ${nginxErr.message}`;
                await domainDoc.save();
                // Potentially rollback cert?
            }
            resolve();
        });
    });
};

module.exports = {
    provisionSSL
};
