const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const http = require('http');
const {WebhookClient} = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

wppconnect.create({
    session: 'sessionName', //Pass the name of the client you want to start the bot
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    headless: true, // Headless chrome
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));


//webhook dialogflow
app.post('/webhook', function(request,response){
  const agent = new WebhookClient ({ request, response });
      let intentMap = new Map();
      intentMap.set('nomedaintencao', nomedafuncao)
      agent.handleRequest(intentMap);
      });
function nomedafuncao (agent) {
}

const sessionClient = new dialogflow.SessionsClient({keyFilename: "zdg-9un9-bf578834c822.json"});

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  let context;
  let intentResponse;
  for (const query of queries) {
      try {
          console.log(`Pergunta: ${query}`);
          intentResponse = await detectIntent(
              projectId,
              sessionId,
              query,
              context,
              languageCode
          );
          console.log('Enviando Resposta');
          console.log(intentResponse.queryResult.fulfillmentText);
          return `${intentResponse.queryResult.fulfillmentText}`
      } catch (error) {
          console.log(error);
      }
  }
}
  
function start(client) {
    client.onMessage(async (msg) => {
      try {
        if (msg.type === "chat") {
          let textoResposta = await executeQueries("zdg-9un9", msg.from, [msg.body], 'pt-BR');
          client.sendText(msg.from, textoResposta);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

server.listen(port, function() {
    console.log('App running on *: ' + port);
  });
  