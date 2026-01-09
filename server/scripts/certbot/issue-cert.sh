#!/bin/bash

# Arguments:
# $1: Domain
# $2: Auth Hook Script Path
# $3: Cleanup Hook Script Path

DOMAIN=$1
AUTH_HOOK=$2
CLEANUP_HOOK=$3

if [ -z "$DOMAIN" ]; then
    echo "Error: No domain provided"
    exit 1
fi

# Certbot command
# --non-interactive: Run without asking for user input
# --agree-tos: Agree to terms
# --manual: Use manual plugin (required for custom hooks)
# --preferred-challenges dns: Use DNS validation
# --manual-auth-hook: Script to set TXT record
# --manual-cleanup-hook: Script to clean up TXT record
# -m: Email for renewal (replace with actual admin email)

certbot certonly \
    --non-interactive \
    --agree-tos \
    --manual \
    --preferred-challenges dns \
    --manual-auth-hook "$AUTH_HOOK" \
    --manual-cleanup-hook "$CLEANUP_HOOK" \
    -d "$DOMAIN" \
    -m info@equartistech.com

# Check exit code
if [ $? -eq 0 ]; then
    echo "Certificate issued successfully for $DOMAIN"
    exit 0
else
    echo "Certificate issuance failed for $DOMAIN"
    exit 1
fi
