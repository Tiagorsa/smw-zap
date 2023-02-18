const wppconnect = require('@wppconnect-team/wppconnect');
const pg = require('./helpers/pg.js');

wppconnect.create({
    session: 'sessionName', //Pass the name of the client you want to start the bot
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    headless: false, // Headless chrome
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

  function start(client) {
    console.log('Iniciando o BOT...');
    client.onMessage(async (msg) => {
      try {

        //setar usuário no pg
        const user = msg.from.replace(/\D/g, '');
        const getUser = await pg.getUser(user);
        if(getUser == false) {
            setUserFrom = await pg.setUser(user);
        }

        //setar pergunta
        const pergunta = msg.body;
        const resposta = await pg.lerPergunta(pergunta);

        if (resposta !== false) {
             console.log('Resposta OK: ' + resposta);
             client.sendText(msg.from, resposta);
        }

        else if (resposta === false && msg.body !== '!btn') {
            client.sendText(msg.from, 'Não entendi sua pergunta.');
        }

        else if (resposta === false && msg.body === '!btn') {
          await client.sendMessageOptions(msg.from, 'ZDG', {
            title: 'Quer entrar pra Comunidade ZDG?',
            footer: 'Escolha uma opção abaixo',
            isDynamicReplyButtonsMsg: true,
            dynamicReplyButtons: [
              {
                buttonId: 'idSim',
                buttonText: {
                  displayText: 'SIM',
                },
                type: 1,
              },
              {
                buttonId: 'idNao',
                buttonText: {
                  displayText: 'Lógico',
                },
                type: 1,
              },
            ],
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }