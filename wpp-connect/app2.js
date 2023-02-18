const wppconnect = require('@wppconnect-team/wppconnect');
const db = require('./helpers/mysql.js');

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

        //setar usuário no mysql
        const user = msg.from.replace(/\D/g, '');
        const getUser = await db.getUser(user);
        if(getUser == false) {
            setUserFrom = await db.setUser(user);
        }

        //setar pergunta
        const pergunta = msg.body;
        const resposta = await db.lerPergunta(pergunta);

        if (resposta !== false) {
             console.log('Resposta BD: ' + resposta);
             client.sendText(msg.from, resposta);
        }

        else if (resposta === false && msg.body.startsWith('!btn ' )) {
          const botao = msg.body.split(' ')[1];
          const button = await db.lerBotao(botao);
          const title = button[0];
          const footer = button[1];
          const body = button[2];
          const btn1 = button[3];
          const btn2 = button[4];
          await client.sendMessageOptions(msg.from, body, {
            title: title,
            footer: footer,
            isDynamicReplyButtonsMsg: true,
            dynamicReplyButtons: [
              {
                buttonId: 'id1',
                buttonText: {
                  displayText: btn1,
                },
                type: 1,
              },
              {
                buttonId: 'id2',
                buttonText: {
                  displayText: btn2,
                },
                type: 1,
              },
            ],
          });
        }

        else if (resposta === false) {
            client.sendText(msg.from, 'Não entendi sua pergunta.');
        }

      } catch (e) {
        console.log(e);
      }
    });
  }