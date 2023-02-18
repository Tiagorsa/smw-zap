#!/bin/bash

# https://botw.smw-zap.net.br/send-message/
url='https://botw.smw-zap.net.br'

curl -v \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"number":"9198265091","message":"Olá"}' \
       $url/send-message/
