// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
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
const request = require('request');

// PORTA ONDE O SERVIÇO SERÁ INICIADO
const port = 8000;
const idClient = 'BOT-SMW';

// SERVIÇO EXPRESS
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

// PARÂMETROS DO CLIENT DO WPP
const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  puppeteer: {
    headless: true,
    // CAMINHO DO CHROME PARA WINDOWS (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    //===================================================================================
    // CAMINHO DO CHROME PARA MAC (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //===================================================================================
    // CAMINHO DO CHROME PARA LINUX (REMOVER O COMENTÁRIO ABAIXO)
    executablePath: '/usr/bin/google-chrome-stable',
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
    ]
  }
});

// INITIALIZE DO CLIENT DO WPP
client.initialize();

// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on('connection', function (socket) {
  socket.emit('message', '© BOT-SMW - Iniciado');
  socket.emit('qr', './icon.svg');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-SMW QRCode recebido, aponte a câmera  seu celular!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', '© BOT-SMW Dispositivo pronto!');
    socket.emit('message', '© BOT-SMW Dispositivo pronto!');
    socket.emit('qr', './check.svg')
    console.log('© BOT-SMW Dispositivo pronto');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-SMW Autenticado!');
    socket.emit('message', '© BOT-SMW Autenticado!');
    console.log('© BOT-SMW Autenticado');
  });

  client.on('auth_failure', function () {
    socket.emit('message', '© BOT-SMW Falha na autenticação, reiniciando...');
    console.error('© BOT-SMW Falha na autenticação');
  });

  client.on('change_state', state => {
    console.log('© BOT-SMW Status de conexão: ', state);
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', '© BOT-SMW Cliente desconectado!');
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
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
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
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
  var options = {
    'method': 'POST',
    // 'url': 'https://n8n.smw-zap.net.br/webhook/691dc98d-319e-4376-9594-daa1c4b48d1d',
    'url': 'https://n8n.smw-zap.net.br/webhook-test/691dc98d-319e-4376-9594-daa1c4b48d1d',
    'headers': {
      'Content-Type': 'application/json'
    },
    json: msg
  };

  request(options, function (error, response) {
    if (error) {
      throw new Error(error);
    }
    else {
      console.log(response.body);
    }
  });
});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
  console.log('© SMW Bot_2_N8N - Aplicativo rodando na porta *: ' + port);
});
