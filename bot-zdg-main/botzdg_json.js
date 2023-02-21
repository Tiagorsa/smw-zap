// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const fs = require('fs');

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
  const numberDDD = number.substr(0, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;

  if (numberDDD <= 30) {
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
  }
  else if (numberDDD > 30) {
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

// CRIAÇÃO DA PASTA
const dirBot = './bot';
if (!fs.existsSync(dirBot)){
    fs.mkdirSync(dirBot);
}

// EVENTO DE ESCUTA/ENVIO DE MENSAGENS RECEBIDAS PELA API
client.on('message', async msg => {
  const dirFrom = './bot/' + msg.from.replace(/\D/g,'');
  const from = msg.from.replace(/\D/g,'');
  function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
  }
  async function readWriteFileJson(botStatus) {
    let dataFile = [];
    fs.writeFileSync("./bot/" + from + "/bot.json", JSON.stringify(dataFile));
    var data = fs.readFileSync("./bot/" + from + "/bot.json");
    var myObject = JSON.parse(data);
    let newData = {
      status: botStatus,
    };
    await myObject.push(newData);
    fs.writeFileSync("./bot/" + from + "/bot.json", JSON.stringify(myObject));
  }
  if (!fs.existsSync(dirFrom)){
    fs.mkdirSync(dirFrom);
    await readWriteFileJson("on");
    console.log('bot on')
  }
  const status = fs.readFileSync("./bot/" + from + "/bot.json","utf8").split(':')[1].replace(/\W/g, '');
  if (msg.body !== null && msg.body === "5") {
    await readWriteFileJson("on");
    msg.reply('BOT ON');
  }
  else if (msg.body !== null && msg.body === "4") {
    await readWriteFileJson("off");
    msg.reply('BOT OFF');
    delay(5000).then(async function() {
      await readWriteFileJson("on");
      msg.reply('BOT ON de NOVO');
    });  
  }
  else if (msg.body !== null && msg.body === "3" && status === "on") {
    msg.reply('Resposta 3')
  }
  else if (msg.body !== null && msg.body === "2" && status === "on") {
    msg.reply('Resposta 2')
  }
  else if (msg.body !== null && msg.body === "1" && status === "on") {
    msg.reply('Resposta 1')
  }
  else if (msg.body !== null && status === "on" && msg.body !== "1" && msg.body !== "2" && msg.body !== "3" && msg.body !== "4" && msg.body !== "5") {
    msg.reply('Escolha sua opção:\n\n*1-* Quem é você?\n*2-* Quem sou eu?\n*3-* Onde eu estou?\n*4-* Falar com Humano\n*5-* Falar com o BOT');
  }
});

// INITIALIZE DO SERVIÇO
server.listen(port, function() {
  console.log('© Comunidade ZDG - Aplicativo rodando na porta *: ' + port);
});
