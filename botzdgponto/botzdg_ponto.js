const { Client, LocalAuth, Location, List } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8001;
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
    database: 'pontozdg'
  });
}

const getUser = async (msgfom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT contato FROM colaborador WHERE contato = ?', [msgfom]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const getEntrada = async (msgfom, dia) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT * FROM entrada WHERE colaborador = ? AND dia = ?', [msgfom, dia]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const delEntrada = async (msgfom, dia) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('DELETE FROM entrada WHERE colaborador = ? AND dia = ?', [msgfom, dia]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const setEntrada = async (colaborador, dia, horario, local) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('INSERT INTO entrada (`id`, `colaborador`, `dia`, `horario`, `local`) VALUES (NULL, ?, ?, ?, ?)', [colaborador, dia, horario, local]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return rows[0];
  return false;
}

const getSaida = async (msgfom, dia) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('SELECT * FROM saida WHERE colaborador = ? AND dia = ?', [msgfom, dia]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const delSaida = async (msgfom, dia) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('DELETE FROM saida WHERE colaborador = ? AND dia = ?', [msgfom, dia]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return true;
  return false;
}

const setSaida = async (colaborador, dia, horario, local) => {
  const connection = await createConnection();
  const [rows] = await connection.execute('INSERT INTO saida (`id`, `colaborador`, `dia`, `horario`, `local`) VALUES (NULL, ?, ?, ?, ?)', [colaborador, dia, horario, local]);
  delay(1000).then(async function () {
    await connection.end();
    delay(500).then(async function () {
      connection.destroy();
    });
  });
  if (rows.length > 0) return rows[0];
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
  authStrategy: new LocalAuth({ clientId: 'botzdg-ponto' }),
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

client.on('message', async msg => {

  //console.log(msg)

  if (msg.type.toLowerCase() == "e2e_notification") return null;
  if (msg.body === "") return null;

  const nomeContato = msg._data.notifyName;
  const user = msg.from.replace(/\D/g, '');
  const hoje = new Date();
  const dataMes = hoje.getMonth() + 1;
  const dataHoje = hoje.getFullYear() + '-' + dataMes + '-' + hoje.getDate();
  const horario = hoje.getHours() + ':' + hoje.getMinutes() + ':' + hoje.getSeconds() + ':' + hoje.getMilliseconds();
  const getUserBD = await getUser(user);
  const getEntradaBD = await getEntrada(user, dataHoje);
  const getSaidaBD = await getSaida(user, dataHoje);

  if (getUserBD) {
    if (msg.body !== "" && msg.type !== 'list_response' && msg.type !== 'location') {
      let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
      let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
      client.sendMessage(msg.from, list);
    }
    if (msg.body === 'Quero registrar minha entrada\nEscolha essa opção e envie a sua localização' && msg.type == 'list_response' && msg.type !== 'location') {
      if (getEntradaBD) {
        msg.reply('Sua entrada já foi registrada hoje.')
      }
      if (!getEntradaBD) {
        msg.reply('Por favor, envie a sua localização e sua entrada será registrada.')
      }
    }
    if (msg.body === 'Quero registrar minha saída\nEscolha essa opção e envie a sua localização' && msg.type == 'list_response' && msg.type !== 'location') {
      if (getSaidaBD) {
        msg.reply('Sua saída já foi registrada hoje.')
      }
      if (!getSaidaBD) {
        msg.reply('Por favor, envie a sua localização sua saída será registrada.')
      }
    }
    if (msg.body === 'Quero apagar meus registros\n' + 'Essa opção apaga todos os seus registros de hoje' && msg.type == 'list_response' && msg.type !== 'location') {
      if (getEntradaBD) {
        msg.reply('Sua entrada de hoje foi removida.')
        await delEntrada(user, dataHoje);
      }
      if (getSaidaBD) {
        msg.reply('Sua saída de hoje foi removida.')
        await delSaida(user, dataHoje);
      }
      if (getEntradaBD && getSaidaBD) {
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
      if (!getEntradaBD) {
        msg.reply('Você ainda não realizou sua entrada hoje.');
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
      if (!getSaidaBD) {
        msg.reply('Você ainda não realizou sua saída hoje.');
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
    }
    if (msg.type === 'location') {
      if (!getEntradaBD && !getSaidaBD) {
        msg.reply('Entrada registrada.');
        const localizacao = 'https://www.google.com/maps/search/?api=1&query=' + msg.location.latitude + ',' + msg.location.longitude;
        await setEntrada(user, dataHoje, horario, localizacao);
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
      if (getEntradaBD && !getSaidaBD) {
        msg.reply('Saída registrada.');
        const localizacao = 'https://www.google.com/maps/search/?api=1&query=' + msg.location.latitude + ',' + msg.location.longitude;
        await setSaida(user, dataHoje, horario, localizacao);
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
      if (getEntradaBD && getSaidaBD) {
        msg.reply('Você já registrou sua entrada e sua saída.');
        delay(2000).then(async function () {
          let sections = [{ title: '© Comunidade ZDG', rows: [{ title: 'Quero registrar minha entrada', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero registrar minha saída', description: 'Escolha essa opção e envie a sua localização' }, { title: 'Quero apagar meus registros', description: 'Essa opção apaga todos os seus registros de hoje' }] }];
          let list = new List('Olá ' + nomeContato + ', tudo bem? Escolha uma opção no menu clicando no botão abaixo', 'Registrar', sections, 'Faça o registro da sua atividade', '© Comunidade ZDG');
          client.sendMessage(msg.from, list);
        });
      }
    }
  }
  if (!getUserBD) {
    msg.reply('Olá ' + nomeContato + ' solicite ao administrador a inserção do seu contato no sistema.')
  }
});


server.listen(port, function () {
  console.log('App running on *: ' + port);
});
