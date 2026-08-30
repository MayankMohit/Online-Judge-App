#!/bin/sh
# Certbot deploy hook: runs only when a certificate was actually renewed.
#
# nginx reads ssl_certificate once at startup and /etc/letsencrypt is a read-only
# bind mount into the frontend container, so a renewal on the host is invisible to
# the running container until it restarts. Without this hook the cert renews on
# disk and the site still serves the old (eventually expired) one.
#
# Install on the VM as:
#   sudo cp deploy/certbot-deploy-hook.sh /etc/letsencrypt/renewal-hooks/deploy/restart-frontend.sh
#   sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-frontend.sh
set -e
cd /home/ubuntu/app
docker-compose restart frontend
