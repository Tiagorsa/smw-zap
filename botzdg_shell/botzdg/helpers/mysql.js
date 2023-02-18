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

// CONSULTAS NO BANCO DE DADOS
const getReply = async (keyword) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT resposta FROM botzdg WHERE pergunta = ?', [keyword]);
	if (rows.length > 0) return rows[0].resposta;
	return false;
}

// EXPORTANDO FUNÇÕES PARA API
module.exports = {
	createConnection,
	getReply
}