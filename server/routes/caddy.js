const express = require("express");
const router = express.Router();
const Domain = require("../models/Domain");

// GET /check-domain?domain=example.com
// Caddy's ask endpoint expects a 200 OK if allowed, otherwise 4xx/5xx
router.get("/check-domain", async (req, res) => {
    const { domain } = req.query;

    console.log(`[Caddy] Checking permission for domain: ${domain}`);

    if (!domain) {
        return res.status(400).send("Domain query parameter required");
    }

    try {
        const domainDoc = await Domain.findOne({ domain });

        if (domainDoc && domainDoc.verified) {
            console.log(`[Caddy] Allowed: ${domain}`);
            return res.status(200).send("OK");
        }

        console.log(`[Caddy] Denied (not found or not verified): ${domain}`);
        return res.status(404).send("Domain not recognized");
    } catch (error) {
        console.error(`[Caddy] Error checking domain ${domain}:`, error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
