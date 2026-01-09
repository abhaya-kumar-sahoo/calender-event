const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Domain = require('../models/Domain');
const dns = require('dns').promises;
const sslManager = require('../utils/sslManager');

// Helper to validate domain format
const isValidDomain = (domain) => {
    const re = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return re.test(domain);
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
        console.log(`[Domain] Verification SUCCESS for ${domainDoc.domain}. Starting SSL provisioning...`);
        domainDoc.verified = true;
        domainDoc.verifiedAt = new Date();
        domainDoc.sslStatus = 'pending'; // Trigger SSL Flow
        await domainDoc.save();

        // Trigger background SSL provisioning
        sslManager.provisionSSL(domainDoc._id);

        res.json({ success: true, message: 'Domain verified successfully. SSL provisioning started.' });

    } catch (error) {
        console.error('[Domain] Verify domain error:', error);
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
