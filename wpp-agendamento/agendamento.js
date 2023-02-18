const wppconnect = require('@wppconnect-team/wppconnect');
const db = require('./agendamento-helper.js');
const nodeCron = require("node-cron");

wppconnect.create({
    session: 'sessionName',
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession);
      console.log('Session name: ', session);
    },
    headless: true,
    puppeteerOptions: {
      userDataDir: 'tokens/sessionName'
    }, 
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

async function start(client) {
    console.log('© BOT-ZDG - Iniciando o BOT...');
    client.onMessage(async (msg) => {
      try {
        const gestorZDG = '5535*********@c.us';
        const dataZDGAtual = new Date();
        const dia = ("0" + dataZDGAtual.getDate()).slice(-2);
        const mes = ("0" + (dataZDGAtual.getMonth() + 1)).slice(-2);
        const ano = dataZDGAtual.getFullYear();
        const dataZDG = ano + "-" + mes + "-" + dia;
        const agendamentos = await db.getAgendamento(dataZDG)
        if (agendamentos === false){
          client.sendText(gestorZDG, 'Sem agendamentos para o dia: ' + dataZDG)
          return;
        }
        if(msg.body === 'zdg' && agendamentos != false){
          for (const agendamento of agendamentos){
            client.sendText(agendamento.destinatario + '@c.us', agendamento.mensagem + '\nStatus do envio: ' + agendamento.statusEnvio)
            await db.setAgendamento(agendamento.id)
          }
          client.sendText(gestorZDG, 'Mensagens do dia ' + dataZDG + ' enviadas com sucesso.')
        }
      } catch (e) {
        console.log(e);
      }
    });
    nodeCron.schedule("00 54 15 * * *", async function zdgAgendamento() {
        const gestorZDG = '5535*********@c.us';
        const dataZDGAtual = new Date();
        const dia = ("0" + dataZDGAtual.getDate()).slice(-2);
        const mes = ("0" + (dataZDGAtual.getMonth() + 1)).slice(-2);
        const ano = dataZDGAtual.getFullYear();
        const dataZDG = ano + "-" + mes + "-" + dia;
        const agendamentos = await db.getAgendamento(dataZDG)
        for (const agendamento of agendamentos){
          client.sendText(agendamento.destinatario + '@c.us', agendamento.mensagem)
          await db.setAgendamento(agendamento.id)
        }
        client.sendText(gestorZDG, 'Mensagens do dia ' + dataZDG + ' enviadas com sucesso.')
      }
    );
  }