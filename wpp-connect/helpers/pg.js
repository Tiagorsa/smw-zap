const { Client } = require('pg');

const client = new Client({
	connectionString: 'INSERIR CONNECTION STRING',
ssl: {
rejectUnauthorized: false
}
});

client.connect();

const lerPergunta = async (pergunta) => {
	try {
		const res = await client.query('SELECT resposta FROM respostas WHERE pergunta = $1', [pergunta]);
		if (res.rows !== null) return res.rows[0].resposta;
		//return false;
	} catch (err) {
        return false;
	}
}

const setUser = async (user) => {
	try {
		const res = await client.query('INSERT INTO contatos (whatsapp) VALUES($1)', [user]);
		if (res.rows !== null) return res.rows[0].id;
		//return false;
	} catch (err) {
        return false;
	}
}

const getUser = async (user) => {
	try {
        const res = await client.query('SELECT whatsapp FROM contatos WHERE whatsapp = $1', [user]);
        if (res.rows > 0 ) return res.rows[0].whatsapp;
	} catch (err) {
        return false;
	}
}

module.exports = {
	lerPergunta,
    setUser,
    getUser
}
