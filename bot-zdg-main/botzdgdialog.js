// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const {WebhookClient} = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const util = require("util");
const {struct} = require('pb-util');
const fs = require("fs");

// PORTA ONDE O SERVIÇO SERÁ INICIADO
const port = 8000;
const idClient = 'bot-zdg';

// CREDENCIAIS DIALOGFLOW (https://console.cloud.google.com/)
const sessionClient = new dialogflow.SessionsClient({keyFilename: 'zdg-9un9-0aba54d6e44c.json'});
const projectID = 'zdg-9un9';
const languageProjectID = 'pt-br';

// WEBHOOKS DIALOGFLOW
app.post('/webhook', function(request,response){
  const agent = new WebhookClient ({ request, response });

      let intentMap = new Map();
      intentMap.set('nomedaintencao', nomedafuncao)
      agent.handleRequest(intentMap);
}); 
function nomedafuncao (agent) {
}  
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

// FUNÇÕES DIALOGFLOW
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
          //console.log('Enviando Resposta');
          if (isBlank(intentResponse.queryResult.fulfillmentText)){
              console.log('Sem resposta definida no DialogFlow');
              return null;   
          }
          else {
              console.log('Resposta definida no DialogFlow');
              //console.log(intentResponse.queryResult.fulfillmentText);
              return `${intentResponse.queryResult.fulfillmentText}`
          }
      } catch (error) {
          console.log(error);
      }
  }
}
async function detectIntentwithTTSResponse(projectId,
  sessionId,
  query,
  languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
    // The audio query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
    outputAudioConfig: {
      audioEncoding: 'OUTPUT_AUDIO_ENCODING_OGG_OPUS',
    },
  };
  const responses = await sessionClient.detectIntent(request);
  const audioFile = responses[0].outputAudio;
  const outputFile = './' + sessionId + '.ogg';
  util.promisify(fs.writeFile)(outputFile, audioFile, 'base64');
  console.log(`Audio content written to file: ${outputFile}`);
  return responses[0];
} 
async function executeQueriesAudio(projectId, sessionId, queries, languageCode) {
  let intentResponse;
  for (const query of queries) {
      try {
          console.log(`Pergunta: ${query}`);
          intentResponse = await detectIntentwithTTSResponse(
              projectId,
              sessionId,
              query,
              languageCode
          );
          if (isBlank(intentResponse.queryResult.fulfillmentText)){
              console.log('Sem resposta definida no DialogFlow');
              return null;   
          }
          else {
              console.log('Resposta definida no DialogFlow');
              //console.log(intentResponse.queryResult.fulfillmentText);
              return `${intentResponse.queryResult.fulfillmentText}`
          }
      } catch (error) {
          console.log(error);
      }
  }
}
async function detectAudioIntent(
  projectId,
  sessionId,
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // Instantiates a session client
  const sessionClientAudio = sessionClient;

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClientAudio.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // Read the content of the audio file and send it as part of the request.
  const readFile = util.promisify(fs.readFile);
  const inputAudio = await readFile(filename);
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
    },
    inputAudio: inputAudio,
  };
  // Recognizes the speech in the audio and detects its intent.
  const [response] = await sessionClientAudio.detectIntent(request);

  console.log('Detected intent:');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId = contextClient.matchContextFromProjectAgentSessionContextName(
        context.name
      );
      const contextParameters = JSON.stringify(
        //struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
  return `${result.fulfillmentText}`
}

// SERVIÇO EXPRESS
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

// PARÂMETROS DO CLIENT DO WPP
const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  puppeteer: { headless: true,
    // CAMINHO DO CHROME PARA WINDOWS (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    //===================================================================================
    // CAMINHO DO CHROME PARA MAC (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //===================================================================================
    // CAMINHO DO CHROME PARA LINUX (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: '/usr/bin/google-chrome-stable',
    //===================================================================================
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

// INITIALIZE DO CLIENT DO WPP
client.initialize();

// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on('connection', function(socket) {
  socket.emit('message', '© BOT-ZDG - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-ZDG QRCode recebido, aponte a câmera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('message', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('© BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-ZDG Autenticado!');
    socket.emit('message', '© BOT-ZDG Autenticado!');
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-ZDG Cliente desconectado!');
  console.log('© BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});

// EVENTO DE ESCUTA/ENVIO DE MENSAGENS RECEBIDAS PELA API
client.on('message', async msg => {

  function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
  }

  if(!msg.hasMedia || !msg.type === "ptt") {
    //INTERAÇÃO DE TEXTO
    let textoResposta = await executeQueries(projectID, msg.from, [msg.body], languageProjectID);
    msg.reply(textoResposta.replace(/\\n/g, '\n'));

    //INTERAÇÃO DE ÁUDIO - ENVIO
    let textoRespostaAudio = await executeQueriesAudio(projectID, msg.from, [msg.body], languageProjectID);
    const chat = await msg.getChat();
    msg.reply("*BOT ZDG:*\n" + textoRespostaAudio.replace(/\\n/g, '\n'));
    delay(3000).then(function() {
        console.log("Gravando áudio.");
        chat.sendStateRecording();
    });
    delay(6000).then(function() {
        console.log("Baixando a resposta.");
        const mediaResposta = MessageMedia.fromFilePath('./' + msg.from + '.ogg');
        client.sendMessage(msg.from, mediaResposta, {sendAudioAsVoice: true});
    });
  }

  //INTERAÇÃO DE ÁUDIO - RECEBIMENTO
  if(msg.hasMedia && msg.type === "ptt") {
    const mediaPergunta = await msg.downloadMedia();
    const base64data = mediaPergunta.data;
    fs.writeFileSync('A' + msg.from + '.ogg', Buffer.from(base64data.replace('data:audio/ogg; codecs=opus;base64,', ''), 'base64'));
    let audioResposta = await detectAudioIntent(projectID, msg.from, 'A' + msg.from + '.ogg', 'AUDIO_ENCODING_OGG_OPUS', '16000', languageProjectID)
    msg.reply('Estou tentando escutar sua mensagem.');
    msg.reply(audioResposta.replace(/\\n/g, '\n'));
  }

});

// INITIALIZE DO SERVIÇO    
server.listen(port, function() {
  console.log('© Comunidade ZDG - Aplicativo rodando na porta *: ' + port);
});
