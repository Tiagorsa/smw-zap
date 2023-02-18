#!/bin/bash

# reset shell colors
tput init

# https://stackoverflow.com/questions/59895/how-to-get-the-source-directory-of-a-bash-script-from-within-the-script-itself
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  PROJECT_ROOT="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$PROJECT_ROOT/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
PROJECT_ROOT="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

# required imports
source "${PROJECT_ROOT}"/variables/manifest.sh
source "${PROJECT_ROOT}"/utils/manifest.sh
source "${PROJECT_ROOT}"/lib/manifest.sh

# user configs file
if [[ ! -e "${PROJECT_ROOT}"/config ]]; then
  cat << EOF > "${PROJECT_ROOT}"/config
deploy_password=${deploy_password}
mysql_root_password=${mysql_root_password}
db_pass=${db_pass}
EOF
fi

# this file has passwords
sudo su - root <<EOF
chown root:root "${PROJECT_ROOT}"/config
chmod 700 "${PROJECT_ROOT}"/config
EOF
source "${PROJECT_ROOT}"/config

# interactive CLI
inquiry_options

# dependencies related
system_update
system_node_install
system_pm2_install
system_dependencies
system_snapd_install
system_nginx_install
system_certbot_install

# system config
#system_create_user
system_install_n8n

# frontend related
frontend_start_pm2
frontend_nginx_setup

# network related
#system_nginx_conf
system_nginx_restart
system_certbot_setup

# security
frontend_ecosystem
frontend_restart_pm2
