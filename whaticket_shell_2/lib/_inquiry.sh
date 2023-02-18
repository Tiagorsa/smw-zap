#!/bin/bash

get_frontend_url() {
  
  print_banner
  printf "${WHITE} 💻 Digite o domínio da interface web (Frontend):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " frontend_url
}

get_backend_url() {
  
  print_banner
  printf "${WHITE} 💻 Digite o domínio da sua API (Backend):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " backend_url
}

get_backend_port() {
  
  print_banner
  printf "${WHITE} 💻 Digite a porta da sua API (Backend - entre 8090 e 8190):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " backend_port
}

get_frontend_port() {
  
  print_banner
  printf "${WHITE} 💻 Digite a porta da sua API (Frontend - entre 3335 e 3345):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " frontend_port
}

get_db_name() {
  
  print_banner
  printf "${WHITE} 💻 Digite o nome do banco de dados (ex.: whaticket2):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " db_name
}

get_folder_name() {
  
  print_banner
  printf "${WHITE} 💻 Digite o nome da nova pasta (ex.: whaticket2):${GRAY_LIGHT}"
  printf "\n\n"
  read -p "> " folder_name
}

get_urls() {
  
  get_frontend_url
  get_frontend_port
  get_backend_url
  get_backend_port
  get_db_name
  get_folder_name
}

software_update() {
  
  # frontend_update
  backend_update
}

inquiry_options() {
  
  print_banner
  printf "${WHITE} 💻 O que você precisa fazer?${GRAY_LIGHT}"
  printf "\n\n"
  printf "   [1] Instalar\n"
  printf "   [2] Atualizar do conector WWeb.JS\n"
  printf "\n"
  read -p "> " option

  case "${option}" in
    1) get_urls ;;

    2) 
      software_update 
      exit
      ;;

    *) exit ;;
  esac
}

