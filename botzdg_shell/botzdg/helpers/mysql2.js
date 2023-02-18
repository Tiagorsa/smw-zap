// BACKEND DA API
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
const mysql = require('mysql2/promise');

// CREDENCIAIS DO BANCO DE DADOS MYSQL
const createConnection = async () => {
	return await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'zdg-bot'
	});
}

// CONSULTAS NO BANCO DE DADOS
const getStatus = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT status FROM status WHERE usuario = ?', [msgfom]);
	if (rows.length > 0) return rows[0].status;
	return false;
}

const setStatusOn = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE status SET status = "on" WHERE usuario = ?', [msgfom]);
	if (rows.length > 0) return rows[0].status;
	return false;
}

const setStatusOff = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE status SET status = "off" WHERE usuario = ?', [msgfom]);
	if (rows.length > 0) return rows[0].status;
	return false;
}

const getUser = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT usuario FROM status WHERE usuario = ?', [msgfom]);
	if (rows.length > 0) return true;
	return false;
}

const setUser = async (msgfom) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('INSERT INTO `status` (`id`, `status`, `usuario`) VALUES (NULL, "on", ?)', [msgfom]);
	if (rows.length > 0) return rows[0].usuario;
	return false;
}

const getReply = async (keyword) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT resposta FROM chatbot WHERE pergunta = ?', [keyword]);
	if (rows.length > 0) return rows[0].resposta;
	return false;
}

// EXPORTANDO FUNÇÕES PARA API
module.exports = {
	createConnection,
	setUser,
	getUser,
	getReply,
	getStatus,
	setStatusOn,
	setStatusOff
}