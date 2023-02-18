
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

FRONTEND_URL: multi.smw-zap.net.br
BACKEND_URL:  apibot.smw-zap.net.br

## INTRO 30.0 - MULTIDISPARADOR BOT ZDG EM PRODUÇÃO NA VPS [ FACILITADO ]
## https://zdgv2.club.hotmart.com/lesson/BeZEaRM54w/intro-30.0-multidisparador-bot-zdg-em-producao-na-vps-facilitado

## CHECAR PROPAGAÇÃO DO DOMÍNIO

https://dnschecker.org/

## COPIAR A PASTA PARA ROOT E RODAR OS COMANDOS ABAIXO ##

sudo chmod +x ./multidisparador_shell/multisessao
cd ./multidisparador_shell
sudo ./multisessao

===================================================

## APÓS A INSTALAÇÃO

## INSTALAR O CHROME (CASO VOCÊ RECEBA ERRO NA HORA DE COLAR A SENHA DO DEPLOYZDG / RECEBA ERRO NO QRCODE)
sudo su deployzdg
cd ~
sudo apt install -y ./google-chrome-stable_current_amd64.deb
pm2 restart 0

===================================================

## MANUAL 

sudo su root
sudo apt update
sudo apt upgrade
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt-get install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2
subir a pasta da aula
cd botzdg
sudo npm install
node botzdg_multisessao_post.js
sudo npm install -g pm2
pm2 start botzdg_multisessao_post.js
sudo apt install nginx
sudo rm /etc/nginx/sites-enabled/default

sudo nano /etc/nginx/sites-available/botzdgmulti
server {
  server_name multibotzdg.comunidadezdg.com.br;
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

sudo ln -s /etc/nginx/sites-available/botzdgmulti /etc/nginx/sites-enabled 
sudo nginx -t
sudo service nginx restart
sudo apt-get install snapd
sudo snap install notes
sudo snap install --classic certbot
sudo certbot --nginx

===================================================

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

===================================================