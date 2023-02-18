#!/bin/bash

# docker run -d -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n n8n start --tunnel


docker run -it --rm\
 --name n8n\
 -p 5678:5678\
 -v ~/.n8n:/home/node/.n8n\
 -e GENERIC_TIMEZONE="America/Sao_Paulo"\
 -e TZ="America/Sao_Paulo"\
 n8nio/n8n\
 n8n start --tunnel


#  -e N8N_HOST="n8n.smw-zap.net.br"\
#  -e N8N_PROTOCOL="https"\
#  -e N8N_PORT=5678\
#  -e VUE_APP_URL_BASE_API="https://n8n.smw-zap.net.br/"\
#  -e WEBHOOK_TUNNEL_URL="https://n8n.smw-zap.net.br:8443/"\
#  -e N8N_SSL_KEY=/etc/letsencrypt/live/n8n.mydomain.com/privkey.pem\
#  -e N8N_SSL_CERT=/etc/letsencrypt/live/n8n.mydomain.com/cert.pem\


sudo certbot -m tiagosa12@gmail.com \
    --nginx \
    --agree-tos \
    --non-interactive \
    --domains n8n.smw-zap.net.br