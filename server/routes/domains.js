const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Domain = require('../models/Domain');
const dns = require('dns').promises;

// Configure DNS servers to avoid caching issues in long-running processes
require('dns').setServers([
    '8.8.8.8',      // Google DNS
    '8.8.4.4',      // Google DNS Secondary
    '1.1.1.1'       // Cloudflare DNS
]);
// const sslManager = require('../utils/sslManager'); // Caddy handles SSL now

// Configuration
const MAX_DOMAINS_PER_USER = 10;
const BLOCKED_DOMAINS = [
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'amazon.com', 'apple.com', 'microsoft.com',
    'github.com', 'stackoverflow.com', 'reddit.com', 'linkedin.com'
];

// Helper to validate domain format
const isValidDomain = (domain) => {
    const re = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return re.test(domain);
};

// Helper to check if domain is blocked
const isBlockedDomain = (domain) => {
    const baseDomain = domain.split('.').slice(-2).join('.');
    return BLOCKED_DOMAINS.includes(baseDomain) || BLOCKED_DOMAINS.includes(domain);
};

// POST /api/domains - Add a new domain
router.post('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const { domain } = req.body;
        console.log(`[Domain] User ${req.user.email} (${req.user._id}) requesting to add domain: ${domain}`);

        if (!domain || !isValidDomain(domain)) {
            console.log(`[Domain] Invalid domain format: ${domain}`);
            return res.status(400).json({ error: 'Invalid domain format' });
        }

        // Check if domain is blocked
        if (isBlockedDomain(domain)) {
            console.log(`[Domain] Blocked domain attempt: ${domain}`);
            return res.status(403).json({ error: 'This domain cannot be used' });
        }

        // Check user's domain limit
        const userDomainCount = await Domain.countDocuments({ user: req.user._id });
        if (userDomainCount >= MAX_DOMAINS_PER_USER) {
            console.log(`[Domain] User ${req.user._id} exceeded domain limit (${MAX_DOMAINS_PER_USER})`);
            return res.status(429).json({
                error: `You can only add up to ${MAX_DOMAINS_PER_USER} domains`
            });
        }

        // Check if domain exists
        const existing = await Domain.findOne({ domain });
        if (existing) {
            console.log(`[Domain] Domain already exists: ${domain} (Owner: ${existing.user})`);
            if (existing.user.toString() !== req.user._id.toString()) {
                return res.status(409).json({ error: 'Domain already registered by another user' });
            }
            return res.json(existing);
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(16).toString('hex');

        const newDomain = await Domain.create({
            domain,
            user: req.user._id,
            verificationToken,
            sslStatus: 'none'
        });

        console.log(`[Domain] Successfully created domain: ${domain} with token: ${verificationToken}`);
        res.json(newDomain);
    } catch (error) {
        console.error('[Domain] Add domain error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/domains/:id/status
router.get('/:id/status', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const domain = await Domain.findOne({ _id: req.params.id, user: req.user._id });
        if (!domain) return res.status(404).json({ error: 'Domain not found' });

        res.json(domain);
    } catch (error) {
        console.error('[Domain] Get status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/domains/:id/verify - Verify ownership
router.post('/:id/verify', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        console.log(`[Domain] Verifying domain ID: ${req.params.id} for user ${req.user._id}`);

        const domainDoc = await Domain.findOne({ _id: req.params.id, user: req.user._id });
        if (!domainDoc) {
            console.log(`[Domain] Domain not found during verification: ${req.params.id}`);
            return res.status(404).json({ error: 'Domain not found' });
        }

        if (domainDoc.verified) {
            console.log(`[Domain] Domain ${domainDoc.domain} is already verified.`);
            return res.json({ success: true, message: 'Already verified' });
        }

        // Verify TXT record: _verify.<domain> should contain token
        const host = `_verify.${domainDoc.domain}`;
        console.log(`[Domain] resolving TXT for ${host}`);

        let records = [];
        try {
            records = await dns.resolveTxt(host);
        } catch (err) {
            console.log(`[Domain] DNS lookup failed for ${host}:`, err.code);
            // If NODATA or NXDOMAIN, records remains empty
        }

        // Flatten records (record is array of chunks, usually joined)
        const txtValues = records.map(r => r.join(''));
        console.log(`[Domain] TXT records found for ${host}:`, txtValues);

        const isVerified = txtValues.includes(domainDoc.verificationToken);

        if (!isVerified) {
            console.log(`[Domain] Verification failed for ${domainDoc.domain}. Expected: ${domainDoc.verificationToken}`);
            return res.status(400).json({
                success: false,
                error: `Verification failed. TXT record not found or incorrect on ${host}. Found: ${JSON.stringify(txtValues)}`
            });
        }

        // Success
        console.log(`[Domain] Verification SUCCESS for ${domainDoc.domain}. Caddy will handle SSL.`);
        domainDoc.verified = true;
        domainDoc.verifiedAt = new Date();
        domainDoc.sslStatus = 'issued'; // Caddy handles this automatically on-demand
        await domainDoc.save();

        // No need to trigger manual provisioning
        // sslManager.provisionSSL(domainDoc._id);

        res.json({ success: true, message: 'Domain verified successfully. SSL is automatically managed.' });

    } catch (error) {
        console.error('[Domain] Verify domain error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/domains/:id - Delete a domain
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const domain = await Domain.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        console.log(`[Domain] Deleted domain: ${domain.domain} for user ${req.user._id}`);
        res.json({ success: true, message: 'Domain deleted successfully' });
    } catch (error) {
        console.error('[Domain] Delete domain error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/domains/list - List user domains
router.get('/list', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const domains = await Domain.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(domains);
    } catch (error) {
        console.error('List domains error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
