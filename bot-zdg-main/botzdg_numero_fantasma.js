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

// PORTA ONDE O SERVIÇO SERÁ INICIADO
const port = 8000;
const idClient = 'bot-zdg';

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

  const number = req.body.number.replace(/\D/g,'');
  const message = req.body.message;
  const numberDDI = number.substring (0, 2);
  const numberDDD = number.substring(2, 4);
  const numberUser = number.substring(number.length - 8);
  const numberSerie = numberUser.slice(0, 1);

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
    if (numberSerie >= 6) {
      const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
        res.status(200).json({
          status: true,
          message: 'BOT-ZDG Mensagem enviada',
          response: response
        });
        }).catch(err => {
        res.status(500).json({
          status: false,
          message: 'BOT-ZDG Mensagem não enviada',
          response: err.text
        });
        });
      console.log('BOT-ZDG - Série Celular')
    }
    if (numberSerie < 6) {
      const numberZDG = "55" + numberDDD + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
        res.status(200).json({
          status: true,
          message: 'BOT-ZDG Mensagem enviada',
          response: response
        });
        }).catch(err => {
        res.status(500).json({
          status: false,
          message: 'BOT-ZDG Mensagem não enviada',
          response: err.text
        });
        });
      console.log('BOT-ZDG - Série Fixo')
    }
  }
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
});


// Séries designadas pela Anatel para celular (números iniciados com 9, 8, 7 e 6)
const number = '5511912345678';
const numberDDI = number.substring (0, 2);
const numberDDD = number.substring(2, 4);
const numberUser = number.substring(number.length - 8);
const numberSerie = numberUser.slice(0, 1);

// Imprimir números
console.log("numero completo: " + number)
console.log("ddi: " + numberDDI)
console.log("ddd: " + numberDDD)
console.log("usuário: " + numberUser)
console.log("serie: " + numberSerie);

// Testagem Série
if (numberSerie >= 6) {
  console.log('BOT-ZDG - Série Celular')
}
if (numberSerie < 6) {
  console.log('BOT-ZDG - Série Fixo')
}

// Testagem DDD
if (parseInt(numberDDD) <= 30) {
  console.log('BOT-ZDG - Série DDD menor que 30')
}
if (parseInt(numberDDD) > 30) {
  console.log('BOT-ZDG - Série DDD maior que 30')
}

// Testagem DDI
if (numberDDI === '55') {
  console.log('BOT-ZDG - BR')
}
if (numberDDI !== '55') {
  console.log('BOT-ZDG - Estrangeiro')
}



// INITIALIZE DO SERVIÇO    
// server.listen(port, function() {
//   console.log('© Comunidade ZDG - Aplicativo rodando na porta *: ' + port);
// });
