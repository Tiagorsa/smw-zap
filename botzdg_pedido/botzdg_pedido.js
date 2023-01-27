const { Client, LocalAuth, MessageMedia, List, Location, Buttons } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const mysql = require('mysql2/promise');

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  });
}

const createConnection = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zdg'
  });
}

const getUser = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT user FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const setUser = async (msgfom, nome) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('INSERT INTO `pedido` (`id`, `user`, `nome`, `itens`, `total`) VALUES (NULL, ?, ?, "", 0)', [msgfom, nome]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return rows[0].user;
  return false;
}

const getTotal = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT total FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return rows[0].total;
  return false;
}

const setTotal = async (total, msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('UPDATE pedido SET total = ? WHERE pedido.user = ?;', [total, msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const delTotal = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('UPDATE pedido SET total = 0 WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const getItens = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT itens FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return rows[0].itens;
  return false;
}

const setItens = async (itens, msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('UPDATE pedido SET itens = ? WHERE pedido.user = ?;', [itens, msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const delItens = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('UPDATE pedido SET itens = "" WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

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

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'botzdg-pedido' }),
  puppeteer: {
    headless: true,
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

client.initialize();

io.on('connection', function (socket) {
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

  client.on('auth_failure', function () {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-ZDG Falha na autenticação');
  });

  client.on('change_state', state => {
    console.log('© BOT-ZDG Status de conexão: ', state);
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', '© BOT-ZDG Cliente desconectado!');
    console.log('© BOT-ZDG Cliente desconectado', reason);
    client.initialize();
  });
});

// POST send-message
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

  const number = req.body.number;
  const message = req.body.message;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

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

// POST send-media URL
app.post('/send-media', async (req, res) => {
  const number = req.body.number;
  const caption = req.body.caption;
  const fileUrl = req.body.file;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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

// POST send-media PATH
app.post('/send-media2', async (req, res) => {
  //console.log(req);
  const number = req.body.number;
  const caption = req.body.caption;
  const filePath = req.body.file;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  const media = MessageMedia.fromFilePath(filePath);

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { caption: caption }).then(response => {
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

// POST send-location
app.post('/send-location', async (req, res) => {
  //console.log(req);
  const number = req.body.number;
  const lat = req.body.lat;
  const long = req.body.long;
  const title = req.body.title;
  const footer = req.body.footer;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  const location = new Location(parseFloat(lat), parseFloat(long), title + '\n' + footer);

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, location).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, location).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, location).then(response => {
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

// POST send-list
app.post('/send-list', async (req, res) => {
  //console.log(req);
  const number = req.body.number;
  const sectionTitle = req.body.sectionTitle;
  const ListItem1 = req.body.ListItem1;
  const desc1 = req.body.desc1;
  const ListItem2 = req.body.ListItem2;
  const desc2 = req.body.desc2;
  const Title = req.body.Title;
  const footer = req.body.footer;
  const btnText = req.body.btnText;
  const Listbody = req.body.Listbody;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  let sections = [{ title: sectionTitle, rows: [{ title: ListItem1, description: desc1 }, { title: ListItem2, description: desc2 }] }];
  let list = new List(Listbody, btnText, sections, Title, footer);

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

// POST send-record URL
app.post('/send-record', async (req, res) => {
  const number = req.body.number;
  const fileUrl = req.body.file;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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

// POST send-record PATH
app.post('/send-record2', async (req, res) => {
  const number = req.body.number;
  const filePath = req.body.file;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);

  const media = MessageMedia.fromFilePath(filePath);

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, { sendAudioAsVoice: true }).then(response => {
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

// POST send-vcard
app.post('/send-vcard', async (req, res) => {
  const number = req.body.number;
  const nome = req.body.nome;
  const email = req.body.email;
  const telefone = req.body.telefone;
  const info = req.body.info;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  // const nomeString = nome.toString();
  // const emailString = email.toString();
  // const telefoneString = telefone.toString();
  // const infoString = info.toString();

  // const vCard = `BEGIN:VCARD
  // VERSION:3.0
  // FN;CHARSET=UTF-8:${nomeString}
  // N;CHARSET=UTF-8:${nomeString};${nomeString};;;
  // EMAIL;CHARSET=UTF-8;type=HOME,INTERNET:${emailString}
  // TEL;TYPE=HOME,VOICE:${telefoneString}
  // REV:${infoString}
  // END:VCARD`;

  const vCard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    'N:;' + nome + ';;;\n' +
    'FN:' + nome + '\n' +
    'TEL;type=CELL;waid=' + telefone + ':+' + telefone + '\n' +
    'EMAIL;CHARSET=UTF-8;type=HOME,INTERNET:' + email + '\n' +
    'REV:' + info + '\n' +
    'END:VCARD'

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, vCard, { parseVCards: true }).then(response => {
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
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, vCard, { parseVCards: true }).then(response => {
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
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, vCard, { parseVCards: true }).then(response => {
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

client.on('message', async msg => {

  //console.log(msg)

  if (msg.type.toLowerCase() == "e2e_notification") return null;
  if (msg.body === "") return null;

  try {
    const nomeContato = msg._data.notifyName;
    const user = msg.from.replace(/\D/g, '');
    const getUserFrom = await getUser(user);

    if (getUserFrom === false) {
      await setUser(user, nomeContato);
      console.log('Usuário armazenado: ' + user + ' - ' + nomeContato)
    }

    if (getUserFrom !== false) {
      console.log('Usuário já foi armazenado')
    }
  }
  catch (e) {
    console.log('Não foi possível armazenar o usuário' + e)
  }

  const nomeContato = msg._data.notifyName;
  const user = msg.from.replace(/\D/g, '');

  if (msg.body !== "" && msg.type !== 'list_response' && msg.body !== 'Sanduíche\nEscolha as opções' && msg.body !== 'Bebidas\nEscolha as opções' && msg.body !== 'Doces\nEscolha as opções') {
    let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
    let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Realize o seu Pedido', '© Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Sanduíche\nEscolha as opções') {
    let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'X-Burguer', description: 'R$5.00' }, { title: 'X-Egg', description: 'R$6.00' }, { title: 'X-Tudo', description: 'R$7.00' }] }];
    let list = new List('🥪 ' + nomeContato + ', escolha os itens do seu pedido selecionando as opções do menu', 'Fazer pedido', sections, 'Escolha o seu Sanduíche', '© Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Bebidas\nEscolha as opções') {
    let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Coca-Cola', description: 'R$3.00' }, { title: 'Guaraná', description: 'R$3.50' }, { title: 'Água', description: 'R$4.00' }] }];
    let list = new List('🍹 ' + nomeContato + ', escolha os itens do seu pedido selecionando as opções do menu', 'Fazer pedido', sections, 'Escolha a sua Bebida', '© Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Doces\nEscolha as opções') {
    let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Chocolate', description: 'R$1.00' }, { title: 'Bombom', description: 'R$2.00' }, { title: 'Paçoca', description: 'R$3.00' }] }];
    let list = new List('🍬 ' + nomeContato + ', escolha os itens do seu pedido selecionando as opções do menu', 'Fazer pedido', sections, 'Escolha o seu doce', '© Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body.includes('X-Burguer') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('X-Egg') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('X-Tudo') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Coca-Cola') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Guaraná') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Água') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Chocolate') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Bombom') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Paçoca') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Continue o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Reiniciar pedido') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      await delTotal(user);
      await delItens(user);
    });
    delay(2000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
    });
    delay(4000).then(async function () {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Sanduíche', description: 'Escolha as opções' }, { title: 'Bebidas', description: 'Escolha as opções' }, { title: 'Doces', description: 'Escolha as opções' }, { title: 'Reiniciar pedido', description: 'Escolha essa opção para zerar o seu pedido' }, { title: 'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das opções do menu', 'Fazer pedido', sections, 'Realize o seu Pedido', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    });
  }
  if (msg.body.includes('Finalizar pedido') && msg.type == 'list_response') {
    delay(1000).then(async function () {
      const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, 'Seu pedido foi finalizado e enviado para um atendente.\n*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total);
      client.sendMessage('5515998280629@c.us', '*Itens do pedido*: ' + itens.replace(',', '') + '\n*Valor total do pedido*: R$' + total + '\nCliente: ' + nomeContato + ' - ' + user + '\nLink para contato: https://wa.me/' + user);
    });
    delay(4000).then(async function () {
      await delTotal(user);
      await delItens(user);
    });
  }
});


server.listen(port, function () {
  console.log('App running on *: ' + port);
});
