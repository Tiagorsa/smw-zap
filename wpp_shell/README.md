
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

FRONTEND_URL: wpp.smw-zap.net.br
BACKEND_URL:  botzdg.smw-zap.net.br

https://wpp.smw-zap.net.br/wpp-multi


## 180.0 - MULTISESSÃO COM WPP CONNECT [ FACILITADO ]
## https://zdgv2.club.hotmart.com/lesson/NOwpZrjy4m/180.0-multisessao-com-wpp-connect-facilitado

## CHECAR PROPAGAÇÃO DO DOMÍNIO

https://dnschecker.org/

## COPIAR A PASTA PARA ROOT E RODAR OS COMANDOS ABAIXO ##

sudo chmod +x ./wpp_shell/wpp
cd ./wpp_shell
sudo ./wpp

===================================================

## APÓS A INSTALAÇÃO

## INSTALAR O CHROME (CASO VOCÊ RECEBA ERRO NA HORA DE COLAR A SENHA DO DEPLOYZDG / RECEBA ERRO NO QRCODE)
sudo su - deployzdg
cd ~
sudo apt install -y ./google-chrome-stable_current_amd64.deb
pm2 restart 0

===================================================

## MANUAL 

sudo apt update
sudo apt upgrade
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libxss-dev

# Instalando o Chrome na VPS (não mostrei no vídeo)
​wget -c https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get update
sudo apt-get install libappindicator1
sudo dpkg -i google-chrome-stable_current_amd64.deb

===================================================

​cd ~
git clone https://github.com/wppconnect-team/wppconnect-server.git
cd wppconnect-server
npm install
npm run build
sudo npm install -g pm2
pm2 start npm --name wpp -- start
sudo apt install nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/wpp

server {
  server_name botzdg.smw-zap.net.br;
  location / {
    proxy_pass http://127.0.0.1:21465;
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

sudo ln -s /etc/nginx/sites-available/wpp /etc/nginx/sites-enabled 
sudo nginx -t
sudo service nginx restart
sudo apt-get install snapd
sudo snap install notes
sudo snap install --classic certbot

===================================================

## APACHE NA VPS

sudo su root
sudo apt update
sudo apt upgrade
sudo apt install -y apache2 apache2-utils
> alterar porta apache (/etc/apache2/port.conf)
sudo systemctl restart apache2
systemctl status apache2
sudo systemctl enable apache2
apache2 -v
sudo apt install php7.4 libapache2-mod-php7.4 php7.4-mysql php-common php7.4-cli php7.4-common php7.4-json php7.4-opcache php7.4-readline
sudo apt-get install php-curl
sudo a2enmod php7.4
sudo systemctl restart apache2
php --version
sudo nano /var/www/html/info.php
<?php phpinfo(); ?>
sudo a2dismod php7.4
sudo apt install php7.4-fpm
sudo a2enmod proxy_fcgi setenvif
sudo a2enconf php7.4-fpm
sudo systemctl restart apache2
sudo rm /var/www/html/info.php
sudo apt install nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/phpcomunidade

server {
  server_name comunidadephp.comunidadezdg.com.br;
  location / {
    proxy_pass http://127.0.0.1:81;
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

sudo ln -s /etc/nginx/sites-available/phpcomunidade /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx restart
sudo nano /etc/nginx/nginx.conf

client_max_body_size 50M;
# HANDLE BIGGER UPLOADS

sudo nginx -t
sudo service nginx restart
sudo apt-get install snapd
sudo snap install notes
sudo snap install --classic certbot
sudo certbot --nginx​

certbot -m tiagosa12@gmail.com \
        --nginx \
        --agree-tos \
        --non-interactive \
        --domains botzdg.smw-zap.net.br

