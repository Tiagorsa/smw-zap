const mysql = require('mysql2/promise');

const createConnection = async () => {
	return await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'zapdasgalaxias'
	});
}

const lerPergunta = async (pergunta) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT resposta FROM perguntas WHERE pergunta = ?', [pergunta]);
	if (rows.length > 0) return rows[0].resposta;
	return false;
}

const getUser = async (user) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT user FROM user WHERE user = ?', [user]);
	if (rows.length > 0) return rows[0].user;
	return false;
}

const setUser = async (user) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('INSERT INTO user SET user = ?', [user]);
	if (rows.length > 0) return rows[0].user;
	return false;
}

const lerBotao = async (botao) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT title, footer, body, btn1, btn2 FROM botoes WHERE botao = ?', [botao]);
	if (rows.length > 0) return [rows[0].title, rows[0].footer, rows[0].body, rows[0].btn1, rows[0].btn2];
	return false;
}

module.exports = {
	createConnection,
	lerPergunta,
	setUser,
	lerBotao,
	getUser
}