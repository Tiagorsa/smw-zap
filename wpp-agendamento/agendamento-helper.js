const mysql = require('mysql2/promise');

const createConnection = async () => {
	return await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'zdg'
	});
}

const getAgendamento = async (dataEnvio) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT * FROM agendamentos WHERE dataEnvio = ? AND statusEnvio != "Enviado"', [dataEnvio]);
	if (rows.length > 0) return rows;
	return false;
}

const setAgendamento = async (id) => {
	const connection = await createConnection();
	const [rows] = await connection.execute('UPDATE agendamentos SET statusEnvio = "Enviado" WHERE id = ?', [id]);
	if (rows.length > 0) return rows;
	return false;
}

module.exports = {
	getAgendamento,
	setAgendamento
}