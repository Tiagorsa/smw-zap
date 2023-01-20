
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

BOTZDG: botzdg.smw-zap.net.br

## CHECAR PROPAGAÇÃO DO DOMÍNIO

https://dnschecker.org/

## COPIAR A PASTA PARA ROOT E RODAR OS COMANDOS ABAIXO ##

sudo chmod +x ./botzdg_shell/botzdg
cd ./botzdg_shell
sudo ./botzdg

================================================

## MANUAL 

sudo apt update
sudo apt upgrade
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt-get install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
sudo apt-get install libasound2
subir a pasta da aula
sudo apt install unzip
unzip botzdg.zip
cd botzdg
sudo npm install
node botzdg.js
sudo npm install -g pm2
pm2 start botzdg.js
sudo apt install nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/botzdg

server {
  server_name botzdg.comunidadezdg.com.br;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
  }

sudo ln -s /etc/nginx/sites-available/botzdg /etc/nginx/sites-enabled 
sudo nginx -t
sudo service nginx restart
sudo apt-get install snapd
sudo snap install notes
sudo snap install --classic certbot
sudo certbot --nginx
