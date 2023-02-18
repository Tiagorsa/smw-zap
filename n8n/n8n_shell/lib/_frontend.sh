#!/bin/bash
# 
# functions for setting up app frontend

#######################################
# starts frontend using pm2 in 
# production mode.
# Arguments:
#   None
#######################################
frontend_start_pm2() {
  print_banner
  printf "${WHITE} 💻 Iniciando pm2 (n8n)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  sudo su - root <<EOF
  pm2 start n8n
EOF

  sleep 2
}

#######################################
# nginx
# Arguments:
#   None
#######################################
frontend_nginx_setup() {
  print_banner
  printf "${WHITE} 💻 Configurando nginx (frontend)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  frontend_hostname=$(echo "${frontend_url/https:\/\/}")

sudo su - root << EOF

cat > /etc/nginx/sites-available/n8n << 'END'

server {
  server_name $frontend_hostname;
  location / {
    proxy_pass http://localhost:5678;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_cache off;
  }
}
END

ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled
EOF

  sleep 2
}

#######################################
# set ecosystem
# Arguments:
#   None
#######################################
frontend_ecosystem() {
  print_banner
  printf "${WHITE} 💻 Configurando ecosystem (frontend)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  frontend_hostname=$(echo "${frontend_url/https:\/\/}")

   # ensure idempotency
  frontend_url=$(echo "${frontend_url/https:\/\/}")
  frontend_url=${frontend_url%%/*}
  frontend_url=https://$frontend_url

  sudo su - root <<EOF
  cd .n8n/
  cat > ecosystem.config.js << 'END'
module.exports = {
    apps : [{
        name   : "n8n",
        env: {
            N8N_BASIC_AUTH_ACTIVE:true,
            N8N_BASIC_AUTH_USER:"$n8n_user",
            N8N_BASIC_AUTH_PASSWORD:"$n8n_password",
            N8N_PROTOCOL: "https",
            WEBHOOK_TUNNEL_URL: "$frontend_url",
            N8N_HOST: "$frontend_hostname"
        }
    }]
}
END
EOF

  sleep 2
}

#######################################
# starts frontend using pm2 in 
# production mode.
# Arguments:
#   None
#######################################
frontend_restart_pm2() {
  print_banner
  printf "${WHITE} 💻 Iniciando pm2 (n8n)...${GRAY_LIGHT}"
  printf "\n\n"

  sleep 2

  sudo su - root <<EOF
  cd .n8n/
  pm2 start n8n
  pm2 start ecosystem.config.js
  pm2 startup
  pm2 save
EOF

  sleep 2
}