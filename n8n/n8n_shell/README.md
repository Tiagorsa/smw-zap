===================================================
##                                              ##
##   █████████      ███████         █████████   ##
##         ███      ███    ██       ███         ##
##       ███        ███    ███      ███         ##
##     ███          ███    ███      ███  ████   ##
##   ███            ███    ██       ███    ██   ##
##   █████████      ███████         █████████   ##
##                                              ##
##  ESSE MATERIAL FAZ PARTE DA COMUNIDADE ZDG   ##
##                                              ##
##        PIRATEAR ESSA SOLUÇÃO É CRIME.        ##
##                                              ##
##    © COMUNIDADE ZDG - comunidadezdg.com.br   ##
##                                              ##
===================================================

## CRIAR SUBDOMINIO E APONTAR PARA O IP DA SUA VPS

BOTZDG: n8n.smw-zap.net.br
API n8n_api_2aa81f53d4a0851cee961f494326a586451adea4d2701362fa0a4c3005b88e3cbfbda3a317a719a8
Auth Redirec URL https://n8n.smw-zap.net.br/rest/oauth2-credential/callback

ID cliente
781670818198-7up8m20qgu6vgesd7o6u7mn3v53m7j8l.apps.googleusercontent.com

key
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


Planilha: 
smw-n8n
https://docs.google.com/spreadsheets/d/1J8SxBEQJle-Zr5VUWWOjzJUS4DTjNwXhAfnXl6AYycc/edit?usp=sharing

## CHECAR PROPAGAÇÃO DO DOMÍNIO

https://dnschecker.org/

## COPIAR A PASTA PARA ROOT E RODAR OS COMANDOS ABAIXO ##

sudo chmod +x ./n8n_shell/n8n
cd ./n8n_shell
sudo ./n8n

================================================

## MANUAL 

sudo apt update
sudo apt upgrade
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt install -y build-essential
sudo npm install -g node-gyp
sudo npm install n8n -g --unsafe-perm
n8n start
sudo npm install -g pm2
pm2 start n8n
sudo apt install nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/n8n

server {
  server_name n8n.comunidadezdg.com.br;
  location / {
    proxy_pass http://localhost:5678;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_cache off;
  }
}

ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx restart
sudo apt-get install snapd
sudo snap install notes
sudo snap install --classic certbot
sudo certbot --nginx

================================================

cd .n8n/
nano ecosystem.config.js

module.exports = {
    apps : [{
        name   : "n8n",
        env: {
            N8N_BASIC_AUTH_ACTIVE:true,
            N8N_BASIC_AUTH_USER:"USERNAME",
            N8N_BASIC_AUTH_PASSWORD:"PASSWORD",
            N8N_PROTOCOL: "https",
            WEBHOOK_TUNNEL_URL: "https://n8n.comunidadezdg.com.br/",
            N8N_HOST: "n8n.comunidadezdg​.com.br"
        }
    }]
}

pm2 start n8n
pm2 start ecosystem.config.js
pm2 startup
pm2 save