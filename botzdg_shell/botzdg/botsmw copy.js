// BACKEND
// API Library
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
// const dateFormat = require('dateformat');

// Port Service
const port = 8000;
const idClient = 'bot-smw001';
const bot_version = 'v 0.230.2.18 rev-1335'


bot_memory = {}

// EXPRESS Service
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));
app.use("/", express.static(__dirname + "/"))
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

// WPP Client parameters
const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]
  }
});

// WPP Client Initial
client.initialize();

// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on('connection', function (socket) {
  socket.emit('message', '© BOT-SMW '+bot_version+' - Iniciado');
  socket.emit('qr', './icon.svg');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-SMW '+bot_version+' QRCode recebido, aponte a câmera  seu celular!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', '© BOT-SMW '+bot_version+' - Dispositivo pronto!');
    socket.emit('message', '© BOT-SMW '+bot_version+' - Dispositivo pronto!');
    socket.emit('qr', './check.svg')
    console.log('© BOT-SMW Dispositivo pronto');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-SMW '+bot_version+' - Autenticado!');
    socket.emit('message', '© BOT-SMW '+bot_version+' - Autenticado!');
    console.log('© BOT-SMW Autenticado');
  });

  client.on('auth_failure', function () {
    socket.emit('message', '© BOT-SMW Falha na autenticação, reiniciando...');
    console.error('© BOT-SMW Falha na autenticação');
  });

  client.on('change_state', state => {
    console.log('© BOT-SMW '+bot_version+' - Status de conexão: ', state);
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', '© BOT-SMW '+bot_version+' - Cliente desconectado!');
    console.log('© BOT-SMW Cliente desconectado', reason);
    client.initialize();
  });
});

// POST PARA ENVIO DE MENSAGEM
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number.replace(/\D/g, '');
  const numberDDD = number.substr(0, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;

  if (numberDDD <= 30) {
    const numberFormated = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberFormated, message).then(response => {
      res.status(200).json({
        status: true,
        message: 'BOT-SMW Mensagem enviada',
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'BOT-SMW Mensagem não enviada',
        response: err.text
      });
    });
  }
  else if (numberDDD > 30) {
    const numberFormated = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberFormated, message).then(response => {
      res.status(200).json({
        status: true,
        message: 'BOT-SMW Mensagem enviada',
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'BOT-SMW Mensagem não enviada',
        response: err.text
      });
    });
  }
});

// EVENTO DE ESCUTA/ENVIO DE MENSAGENS RECEBIDAS PELA API
client.on('message', async msg => {
  if (msg.type.toLowerCase() == "e2e_notification") return null;
  if (msg.body === "") return null; // Empty Messages
  const nomeContato = msg._data.notifyName;
  const user_from = msg.from;
  const user = user_from.replace(/\D/g, ''); // Only numbers
  // 
  const perfies = { 0: 'VENDEDOR', 1: 'GERENTE-VENDA', 2: 'GERENTE-COMPRA', 3: 'DIRETOR' }
  const locais = { 1: 'MATRIZ', 30: 'Exclusive', 40: 'Pariguis', 70: 'JC', 75: 'BR' }
  const opcoes_perfil = { 0: { 'menu': '*1*-Consulta Produto' } }

  allowed_users = ["559198265091"];
  if (allowed_users.includes(user)) {
    console.log('From: ' + user_from + ' Usuário armazenado: ' + user + ' - ' + nomeContato)
    if (user in bot_memory == false) {
      perfil = 0;
      stage = 0;
      local = 1;
      bot_memory[user] = {
          'active': 1
        , 'stage': stage
        , 'perfil': perfil
        , 'local': local
        , 'last_action': new Date().toString()
        , 'last_login': new Date().toString() };
    } else {
      active = bot_memory[user]['active'];
      stage = bot_memory[user]['stage'];
      perfil = bot_memory[user]['perfil'];
      local = bot_memory[user]['local'];
    }
    console.log('Usuário: ' + user + ' - stage: ' + stage)
    console.log('Local: ' + locais[local] + ' perfil ' + perfies[perfil])
    console.log('last_action: ' + bot_memory[user]['last_action'] + '\n last_login: ' + bot_memory[user]['last_login'])

    msg_body = msg.body.toLowerCase();
    console.log('body: [' + msg_body + ']')
    // msg_body=msg_body.toLowerCase();

    if (msg_body === '.doris') {
      if (bot_memory[user]['stage'] == 0) {
        //      123456789-123456789
        text = "Ola! eu sou a Doris\n *IA de Atendimento*";
        text = text + "\nSeu perfil é de *" + perfies[perfil] + "*\nno local:" + locais[local];
        msg.reply(text);
        // client.sendMessage(msg.from, text);
        bot_memory[user]['stage'] = 1;
        bot_memory[user]['last_action']=new Date().toString()
        
        text='Opções do Perfil:'
        text=text+'\n'+opcoes_perfil[perfil]['menu']
        text=text+'\n*0*-Mostrar opções'
        client.sendMessage(msg.from, text);

      } else {
        text = "Doris Destativada!!";
        // msg.reply(text);
        client.sendMessage(msg.from, text);
        bot_memory[user]['stage'] = 0;
        bot_memory[user]['last_action']=new Date().toString()
      }
    }
    else if (bot_memory[user]['stage'] >= 1) {

    }
    else if (msg_body === 'media1') {
      const media1 = MessageMedia.fromFilePath('./icon.png');
      client.sendMessage(msg.from, media1, { caption: 'imagem' });
    }
    else if (msg_body === 'media4') {
      const media4 = MessageMedia.fromFilePath('./video.mp4');
      client.sendMessage(msg.from, media4, { caption: 'video' });
    }
    //chamada via url
    else if (msg_body === 'mediaurl') {
      const mediaUrl = await MessageMedia.fromUrl('https://static.wixstatic.com/media/f930ec_dadb21066af74a0aab01d8463ea643e8~mv2.png/v1/fill/w_92,h_128,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Sologo.png');
      client.sendMessage(msg.from, mediaUrl, { caption: 'imagem' });
    }

  }

});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
  console.log('SMW Bot - Aplicativo rodando na porta *: ' + port);
});
