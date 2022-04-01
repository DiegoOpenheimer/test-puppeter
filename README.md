
# Script para recuperação de dados na ONS para obtenção de valores de energia renovável e não renovável.

## Utilização do script.

para executar o script, a 3 opções:
* Executar script normal com comando npm start ou node .
* Executar com delay, com o comando npm run start-delay ou node . --delay
* Executar persistindo o documento excel no mesmo diretório, com o comando npm run start-persist ou o comando node . --persist
* Obs: é possível passar as duas flags como argumento, node . --persist --delay

## Modo de desenvolvimento
* É possível usar todos os comandos acima para visualizar todo o processo que é feito no browser,
basta passar a flag  --dev, ex: node . --dev, node . --persist --delay --dev ou npm run start -- --dev
