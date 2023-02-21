// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
const mysql = require('mysql2/promise');

// CREDENCIAIS DO BANCO DE DADOS MYSQL
const createConnection = async () => {
	return await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'zdgteste'
	});
}

// DELAY PARA FECHAR A CONEXAO
function delay(t, v) {
	return new Promise(function(resolve) { 
		setTimeout(resolve.bind(null, v), t)
	});
}

// CONSULTAS NO BANCO DE DADOS
const getReply = async (keyword) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT resposta FROM botzdg WHERE pergunta = ?', [keyword]);
	delay(1000).then(async function() {
		await connection.end();
		delay(500).then(async function() {
			connection.destroy();
			//console.log('© BOT-ZDG Conexão fechada')
		});
		//console.log('© BOT-ZDG Conexão fechada')
	});
	if (rows.length > 0) return rows[0].resposta;
	return false;
}

// EXPORTANDO FUNÇÕES PARA API
module.exports = {
	createConnection,
	getReply
}