// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
// npm i github:pedroslopez/whatsapp-web.js#fix-buttons-list
// Depende do git para baixar a extensao das listas/botoes
const { Client, LocalAuth, List, Buttons } = require('whatsapp-web.js');
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

// POST PARA ENVIO DE BOTOES
app.post('/send-button', [
  body('number').notEmpty()
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
  const botao1 = req.body.botao1;
  const botao2 = req.body.botao2;
  const botao3 = req.body.botao3;
  const descricao = req.body.descricao;
  const title = req.body.title;
  const footer = req.body.footer;
  const numberDDI = number.substring (0, 2);
  const numberDDD = number.substring(2, 4);
  const numberUser = number.substring(number.length - 8);
  const numberSerie = numberUser.slice(0, 1);
  const buttons_reply = new Buttons(descricao, [{body: botao1, id: 'test-1'},{body: botao2, id: 'test-2'},{body: botao3, id: 'test-3'}], title, footer)

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, buttons_reply).then(response => {
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
      client.sendMessage(numberZDG, buttons_reply).then(response => {
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
      const numberZDGVal = "55" + numberDDD + "9" + numberUser + "@c.us";
      client.sendMessage(numberZDGVal, buttons_reply);
      const numberZDG = "55" + numberDDD + numberUser + "@c.us";
      client.sendMessage(numberZDG, buttons_reply).then(response => {
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
    client.sendMessage(numberZDG, buttons_reply).then(response => {
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

// POST PARA ENVIO DE LISTAS
app.post('/send-list', [
  body('number').notEmpty()
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
  const botao = req.body.botao;
  const descricao = req.body.descricao;
  const title = req.body.title;
  const footer = req.body.footer;
  const titleOp = req.body.titleOp;
  const title1 = req.body.title1;
  const title2 = req.body.title2;
  const title3 = req.body.title3;
  const desc1 = req.body.desc1;
  const desc2 = req.body.desc2;
  const desc3 = req.body.desc3;
  const numberDDI = number.substring (0, 2);
  const numberDDD = number.substring(2, 4);
  const numberUser = number.substring(number.length - 8);
  const numberSerie = numberUser.slice(0, 1);
  const section = {
    title: titleOp,
    rows: [
      {
        title: title1,
        description: desc1,
        id: 'test-1'
      },
      {
        title: title2,
        description: desc2,
        id: 'test-2'
      },
      {
        title: title3,
        description: desc3,
        id: 'test-3'
      }
    ],
  };
  const list = new List(descricao, botao, [section], title, footer)

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, list).then(response => {
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
      client.sendMessage(numberZDG, list).then(response => {
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
      const numberZDGVal = "55" + numberDDD + "9" + numberUser + "@c.us";
      client.sendMessage(numberZDGVal, list);
      const numberZDG = "55" + numberDDD + numberUser + "@c.us";
      client.sendMessage(numberZDG, list).then(response => {
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
    client.sendMessage(numberZDG, list).then(response => {
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

// INITIALIZE DO SERVIÇO    
server.listen(port, function() {
  console.log('© Comunidade ZDG - Aplicativo rodando na porta *: ' + port);
});
