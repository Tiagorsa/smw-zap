#!/bin/bash
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

url='http://localhost:3030' 
#  https://opl-smw.sa.ngrok.io/_/theme/pdfs/cotacao/cot-01-00805038448.pdf
# https://opl-smw.sa.ngrok.io/_/api/search_cotacao/1/805038448
# https://opl-smw.sa.ngrok.io/_/api/search_cotacao/75/805038448

api_user="api:smw1329"

pFilial=1
pCotacao=${1-805038448}
       # 00928009627
       # FROM PCORCAVENDAC PED 
       # https://opl-smw.sa.ngrok.io/_/api/search_cotacao/1/928009627

filname="temp/cotacao-$pCotacao.json"
echo "Busca cotação: $pFilial-$pCotacao"
echo "      Filname: $filname"
curl -s -u $api_user \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"User":"91984245276"}' \
       $url/_/api/search_cotacao/$pFilial/$pCotacao -o $filname

cat $filname

echo ""