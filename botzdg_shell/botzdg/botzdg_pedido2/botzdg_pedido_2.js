const { Client, LocalAuth, MessageMedia, List, Location } = require('whatsapp-web.js');
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
  return new Promise(function(resolve) { 
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
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const setUser = async (msgfom, nome) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('INSERT INTO `pedido` (`id`, `user`, `nome`, `itens`, `pagamento`, `localizacao`,  `total`) VALUES (NULL, ?, ?, "", 0, 0, 0)', [msgfom, nome]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return rows[0].user;
	return false;
}

const getTotal = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT total FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return rows[0].total;
	return false;
}

const setTotal = async (total, msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET total = ? WHERE pedido.user = ?;', [total, msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const delTotal = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET total = 0 WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const getItens = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT itens FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return rows[0].itens;
	return false;
}

const setItens = async (itens, msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET itens = ? WHERE pedido.user = ?;', [itens, msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const delItens = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET itens = "" WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const getPagamento = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT pagamento FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return rows[0].pagamento;
	return false;
}

const setPagamento = async (pagamento, msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET pagamento = ? WHERE pedido.user = ?;', [pagamento, msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const delPagamento = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET pagamento = "" WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const setLocalizacao = async (localizacao, msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET localizacao = ? WHERE pedido.user = ?;', [localizacao, msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const delLocalizacao = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE pedido SET localizacao = "" WHERE pedido.user = ?;', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return true;
	return false;
}

const getLocalizacao = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT localizacao FROM pedido WHERE user = ?', [msgfom]);
  delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
		});
	});
	if (rows.length > 0) return rows[0].localizacao;
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
  puppeteer: { headless: true,
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

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', '?? BOT-ZDG - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '?? BOT-ZDG QRCode recebido, aponte a c??mera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '?? BOT-ZDG Dispositivo pronto!');
    socket.emit('message', '?? BOT-ZDG Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('?? BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '?? BOT-ZDG Autenticado!');
    socket.emit('message', '?? BOT-ZDG Autenticado!');
    console.log('?? BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '?? BOT-ZDG Falha na autentica????o, reiniciando...');
    console.error('?? BOT-ZDG Falha na autentica????o');
});

client.on('change_state', state => {
  console.log('?? BOT-ZDG Status de conex??o: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '?? BOT-ZDG Cliente desconectado!');
  console.log('?? BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});


client.on('message', async msg => {

  //console.log(msg)

  if(msg.type.toLowerCase() == "e2e_notification") return null;
  if(msg.body === "") return null;

  try{
    const nomeContato = msg._data.notifyName;
    const user = msg.from.replace(/\D/g, '');
    const getUserFrom = await getUser(user);

    if (getUserFrom === false) {
      await setUser(user, nomeContato);
      console.log('Usu??rio armazenado: ' + user + ' - ' + nomeContato)
    }

    if (getUserFrom !== false) {
      console.log('Usu??rio j?? foi armazenado')
    }
  }
  catch(e){
    console.log('N??o foi poss??vel armazenar o usu??rio' + e)
  }

  const nomeContato = msg._data.notifyName;
  const user = msg.from.replace(/\D/g, '');

  if (msg.body !== "" && msg.type !== 'list_response' && msg.type !== 'location' && msg.body !== 'Forma de pagamento\nEscolher a op????o de pagamento' && msg.body !== 'Endere??o de entrega\nEnviar a localiza????o' && msg.body !== 'Sandu??che\nEscolha as op????es' && msg.body !== 'Bebidas\nEscolha as op????es' && msg.body !== 'Doces\nEscolha as op????es') {
    let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
    let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Fazer pedido',sections,'Realize o seu Pedido','?? Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Sandu??che\nEscolha as op????es' && msg.type !== 'location') {
    let sections = [{title:'?? Comunidade ZDG',rows:[{title:'X-Burguer', description: 'R$5.00'},{title:'X-Egg', description: 'R$6.00'},{title:'X-Tudo', description: 'R$7.00'}]}];
    let list = new List('???? ' + nomeContato + ', escolha os itens do seu pedido selecionando as op????es do menu','Fazer pedido',sections,'Escolha o seu Sandu??che','?? Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Bebidas\nEscolha as op????es' && msg.type !== 'location') {
    let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Coca-Cola', description: 'R$3.00'},{title:'Guaran??', description: 'R$3.50'},{title:'??gua', description: 'R$4.00'}]}];
    let list = new List('???? ' + nomeContato + ', escolha os itens do seu pedido selecionando as op????es do menu','Fazer pedido',sections,'Escolha a sua Bebida','?? Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Doces\nEscolha as op????es' && msg.type !== 'location') {
    let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Chocolate', description: 'R$1.00'},{title:'Bombom', description: 'R$2.00'},{title:'Pa??oca', description: 'R$3.00'}]}];
    let list = new List('???? ' + nomeContato + ', escolha os itens do seu pedido selecionando as op????es do menu','Fazer pedido',sections,'Escolha o seu doce','?? Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body === 'Endere??o de entrega\nEnviar a localiza????o' && msg.type !== 'location') {
    client.sendMessage(msg.from, 'Por favor, envie a localiza????o atrav??s do seu WhatsApp.');
  }
  if (msg.body === 'Forma de pagamento\nEscolher a op????o de pagamento' && msg.type !== 'location') {
    let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Cart??o de cr??dito', description: 'Pagamento OK'},{title:'Dinheiro', description: 'Pagamento OK'},{title:'PIX', description: 'Pagamento OK'}]}];
    let list = new List('???? ' + nomeContato + ', escolha a forma de pagamento','Fazer pedido',sections,'Forma de Pagamento','?? Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body.includes('Cart??o de cr??dito') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
			await delPagamento(user);
		});
    delay(2000).then(async function() {
      await setPagamento(msg.body.split('\n')[0], user);
      client.sendMessage(msg.from, 'Forma de pagamento escolhida: ' + msg.body.split('\n')[0]);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Dinheiro') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
			await delPagamento(user);
		});
    delay(2000).then(async function() {
      await setPagamento(msg.body.split('\n')[0], user);
      client.sendMessage(msg.from, 'Forma de pagamento escolhida: ' + msg.body.split('\n')[0]);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('PIX') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
			await delPagamento(user);
		});
    delay(2000).then(async function() {
      await setPagamento(msg.body.split('\n')[0], user);
      client.sendMessage(msg.from, 'Forma de pagamento escolhida: ' + msg.body.split('\n')[0]);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('X-Burguer') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('X-Egg') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('X-Tudo') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Coca-Cola') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Guaran??') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('??gua') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Chocolate') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Bombom') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Pa??oca') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      const itens = await getItens(user);
      const total = await getTotal(user);
			await setItens(itens + ', ' + msg._data.listResponse.title, user);
      await setTotal(parseFloat(total) + parseFloat(msg._data.listResponse.description.split('$')[1]), user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Reiniciar pedido') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
      await delTotal(user);
      await delItens(user);
      await delLocalizacao(user);
      await delPagamento(user);
		});
    delay(2000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      client.sendMessage(msg.from, '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total);
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Realizar pedido',sections,'Realize o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
  if (msg.body.includes('Finalizar pedido') && msg.type == 'list_response' && msg.type !== 'location') {
    delay(1000).then(async function() {
			const itens = await getItens(user);
      const total = await getTotal(user);
      const local = await getLocalizacao(user);
      const pagamento = await getPagamento(user);
      client.sendMessage(msg.from, 'Seu pedido foi finalizado e enviado para um atendente.\n*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total + '\n*Endere??o para entrega*: ' + local + '\n*Forma de pagamento*: ' + pagamento);
      client.sendMessage('5515998280629@c.us', '*Itens do pedido*: ' + itens.replace(',','') + '\n*Valor total do pedido*: R$' + total + '\n*Endere??o para entrega*: ' + local + '\n*Forma de pagamento*: ' + pagamento + '\nCliente: ' + nomeContato + ' - ' + user + '\nLink para contato: https://wa.me/' + user);
		});
    delay(4000).then(async function() {
      await delTotal(user);
      await delItens(user);
      await delLocalizacao(user);
      await delPagamento(user);
		});
  }
  if (msg.type === 'location') {
    delay(1000).then(async function() {
      await delLocalizacao(user)
		});
    delay(2000).then(async function() {
      const localizacao = 'https://www.google.com/maps/search/?api=1&query='+msg.location.latitude+','+msg.location.longitude;
      await setLocalizacao(localizacao, user);
      msg.reply('O endere??o para entrega j?? foi armazenado.')
		});
    delay(4000).then(async function() {
      let sections = [{title:'?? Comunidade ZDG',rows:[{title:'Sandu??che', description: 'Escolha as op????es'},{title:'Bebidas', description: 'Escolha as op????es'},{title:'Doces', description: 'Escolha as op????es'},{title:'Reiniciar pedido', description: 'Escolha essa op????o para zerar o seu pedido'},{title:'Forma de pagamento', description: 'Escolher a op????o de pagamento'},{title:'Endere??o de entrega', description: 'Enviar a localiza????o'},{title:'Finalizar pedido', description: 'Encerrar o pedido e enviar para o atendente'}]}];
      let list = new List('Ol?? ' + nomeContato + ', tudo bem? Escolha os itens do seu pedido selecionando uma das op????es do menu','Continuar pedido',sections,'Continuar o seu Pedido','?? Comunidade ZDG');
      client.sendMessage(msg.from, list);
		});
  }
});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
});
