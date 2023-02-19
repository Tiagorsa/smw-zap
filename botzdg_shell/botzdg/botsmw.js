// BACKEND
// API Library
const { Client, List, Buttons, LocalAuth, MessageMedia, Location } = require('whatsapp-web.js');
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
const axios = require('axios').default;

// const dateFormat = require('dateformat');

// Port Service
const port = 8000;
const idClient = 'bot-smw001';
const bot_version = 'v 0.230.2.18 rev-2234'
const currency = require("currency.js");

const REAL = value => currency(value, { symbol: 'R$', decimal: ',', separator: '.' });

bot_memory = {}

// Remote Acess SMW Anvil ERP API
const username = "api";
const password = "smw1329";
const headers = { 'Content-Type': 'application/json' };
const url_main = 'https://opl-smw.sa.ngrok.io/_/api';

// EXPRESS Service
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

// WPP Client parameters
const client = new Client({
    authStrategy: new LocalAuth({ clientId: idClient }),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
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

// WPP Client Initial
client.initialize();

// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on('connection', function (socket) {
    socket.emit('message', '© BOT-SMW ' + bot_version + ' - Iniciado');
    socket.emit('qr', './icon.svg');

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', '© BOT-SMW ' + bot_version + ' QRCode recebido, aponte a câmera  seu celular!');
        });
    });

    client.on('ready', () => {
        socket.emit('ready', '© BOT-SMW ' + bot_version + ' - Dispositivo pronto!');
        socket.emit('message', '© BOT-SMW ' + bot_version + ' - Dispositivo pronto!');
        socket.emit('qr', './check.svg')
        console.log('© BOT-SMW Dispositivo pronto');
    });

    client.on('authenticated', () => {
        socket.emit('authenticated', '© BOT-SMW ' + bot_version + ' - Autenticado!');
        socket.emit('message', '© BOT-SMW ' + bot_version + ' - Autenticado!');
        console.log('© BOT-SMW Autenticado');
    });

    client.on('auth_failure', function () {
        socket.emit('message', '© BOT-SMW Falha na autenticação, reiniciando...');
        console.error('© BOT-SMW Falha na autenticação');
    });

    client.on('change_state', state => {
        console.log('© BOT-SMW ' + bot_version + ' - Status de conexão: ', state);
    });

    client.on('disconnected', (reason) => {
        socket.emit('message', '© BOT-SMW ' + bot_version + ' - Cliente desconectado!');
        console.log('© BOT-SMW Cliente desconectado', reason);
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

    const number = req.body.number.replace(/\D/g, '');
    const numberDDD = number.substr(0, 2);
    const numberUser = number.substr(-8, 8);
    const message = req.body.message;

    if (numberDDD <= 30) {
        const numberFormated = "55" + numberDDD + "9" + numberUser + "@c.us";
        client.sendMessage(numberFormated, message).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT-SMW Mensagem enviada',
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT-SMW Mensagem não enviada',
                response: err.text
            });
        });
    }
    else if (numberDDD > 30) {
        const numberFormated = "55" + numberDDD + numberUser + "@c.us";
        client.sendMessage(numberFormated, message).then(response => {
            res.status(200).json({
                status: true,
                message: 'BOT-SMW Mensagem enviada',
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: 'BOT-SMW Mensagem não enviada',
                response: err.text
            });
        });
    }
});


// EVENTO DE ESCUTA/ENVIO DE MENSAGENS RECEBIDAS PELA API
client.on('message', async msg => {
    if (msg.type.toLowerCase() == "e2e_notification") return null;
    if (msg.body === "") return null; // Empty Messages
    const nomeContato = msg._data.notifyName;
    const user_from = msg.from;
    const user = user_from.replace(/\D/g, ''); // Only numbers
    // 
    const perfies = { 0: 'VENDEDOR', 1: 'GERENTE-VENDA', 2: 'GERENTE-COMPRA', 3: 'DIRETOR' }
    const locais = { 1: 'MATRIZ', 30: 'Exclusive', 40: 'Pariguis', 70: 'JC', 75: 'BR' }
    const opcoes_perfil = { 0: { 'menu': '*1*```-Consulta Produto```', 'avalibel_options': [1] } }

    async function asyncResetOptions(opcoes_perfil, perfil) {
        text = '```Opções do Perfil:```'
        text = text + '\n' + opcoes_perfil[perfil]['menu']
        text = text + '\n*0*```-Mostrar opções```'
        text = text + '\n*.doris*```-Desativa interação```'
        client.sendMessage(msg.from, text);
    }

    function zeroPad(num, numZeros) {
        var n = Math.abs(num);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
        var zeroString = Math.pow(10, zeros).toString().substr(1);
        if (num < 0) {
            zeroString = '-' + zeroString;
        }

        return zeroString + n;
    }

    const sendPostRequest = async (from, url_sufix, search, user, filial = "", almox = "") => {
        // var url_sufix='/search_produto';
        var url_full = url_main + url_sufix;
        var options = {
            method: 'post',
            baseURL: url_main,
            url: url_sufix,
            headers: headers,
            auth: {
                'username': username,
                'password': password
            }
        };
        const newPost = { "SearchProd": search, "User": user };
        if (filial) {
            newPost['Filial'] = filial;
        }
        if (almox) {
            newPost['Almox'] = almox;
        }
        try {
            resp = await axios.post(url_full, newPost, options);
            rawdata = resp.data
            GetProduto(from, search, rawdata)
            // showdata(resp.data)
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    };


    function GetProduto(from, searchStr, rawdata) {
        // let rawdata = fs.readFileSync('temp_codprods-138736.json');
        let prods = rawdata;
        // let prods = JSON.parse(rawdata);
        var max_lengh = 27
        numMatchs = zeroPad(prods['counter'], 5);
        if (numMatchs >= 1) {
            if (numMatchs == 1) {
                codprod = zeroPad(prods['data'][0]['codprod'], 6);
                descricao = '```' + prods['data'][0]['descricao'] + '```';
                marca = prods['data'][0]['marca'];
                ean = marca = prods['data'][0]['codauxiliar'];
                cod_dep = prods['data'][0]['codepto'];
                preco = REAL(prods['data'][0]['preco_orig_win']).format();
                rtnText = 'Econtrei: ' + numMatchs;
                rtnText = rtnText + 'Procurando:' + searchStr;
                rtnText = rtnText + '\n```' + '-'.repeat(max_lengh) + '```';
                rtnText = rtnText + '\nCódigo: ' + codprod;
                rtnText = rtnText + '\nEAN: ' + ean;
                rtnText = rtnText + '\nDescrição:\n' + descricao;
                rtnText = rtnText + '\nPreço:' + preco;
                client.sendMessage(from, rtnText);
            } else {
                // rtnText = 'Econtrei: ' + numMatchs;
                // rtnText = rtnText + '\nProcurando:' + searchStr;
                // rtnText = rtnText + '\n```' + '-'.repeat(max_lengh) + '```';
                // client.sendMessage(from, rtnText);
                rows = []
                for (var i = 0; i < prods['data'].length; i++) {
                    var prod = prods['data'][i];
                    // console.log(prod);
                    descr=zeroPad((i+1),3)+'. '+prod['codprod'] + '-' + prod['descricao'];
                    preco=REAL(prods['data'][i]['preco_orig_win']).format();
                    row = { 
                          title: descr
                        , description: preco };
                    rows.push(row);
                }
                // rows=[
                //       { title: 'X-Burguer', description: 'R$5.00' }
                //     , { title: 'X-Egg', description: 'R$6.00' }
                //     , { title: 'X-Tudo', description: 'R$7.00' }]
                console.log('send list: ' + numMatchs)
                sections = [{
                    title: '© SMWBOT'
                    , rows: rows
                }];
                list = new List('Lista , escolha os itens do seu pedido selecionando as opções do menu'
                    , 'Consulta Produtos'
                    , sections, 'Escolha o seu produto'
                    , '© SMW-BOT');
                client.sendMessage(from, list);
                // console.log('send Button: ');
                // rows=[{ body: 'Aceptar' }, { body: 'rechazar' }]
                // button = new Buttons('Button body', rows, 'title', 'footer');
                // client.sendMessage(from, button);

            }
        } else {
            rtnText = '*Não encontrei nenhum produto*';
            rtnText = rtnText + '\nProcurando:' + searchStr;
            rtnText = rtnText + '\n```' + '-'.repeat(max_lengh) + '```';
            client.sendMessage(from, rtnText);
        }


        text = '```Digite``` *0* ```para opções ou outro *código* para para continuar.```\n';
        client.sendMessage(from, text);

        // return rtnText;
    }

    //559185483773 --From: 559185483773@c.us Usuário armazenado: 559185483773 - Andréa
    // allowed_users = ["559198265091","559185483773"];
    filename_allowed = 'allowed.txt';
    console.log('Read Allowed users: ' + filename_allowed);
    var allowed_users = fs.readFileSync(filename_allowed).toString().split("\n");
    console.log('allowed_users: ' + allowed_users);
    console.log('\nFrom: ' + user_from + ' Usuário armazenado: ' + user + ' - ' + nomeContato)
    if (allowed_users.includes(user)) {
        if (user in bot_memory == false) {
            perfil = 0;
            stage = 0;
            local = 1;
            depto = 1;
            ponto = 'N'
            bot_memory[user] = {
                'active': 1
                , 'stage': stage
                , 'perfil': perfil
                , 'local': local
                , 'depto': depto
                , 'ponto': ponto
                , 'screen_mobile': 27
                , 'last_action': new Date().toString()
                , 'last_login': new Date().toString()
            };
        } else {
            active = bot_memory[user]['active'];
            stage = bot_memory[user]['stage'];
            perfil = bot_memory[user]['perfil'];
            local = bot_memory[user]['local'];
            depto = bot_memory[user]['depto'];
            ponto = bot_memory[user]['ponto'];
        }
        console.log('Usuário: ' + user + ' - stage: ' + stage)
        console.log('Local: ' + locais[local] + ' perfil ' + perfies[perfil])
        console.log('last_action: ' + bot_memory[user]['last_action'] + '\n last_login: ' + bot_memory[user]['last_login'])

        msg_body = msg.body.toLowerCase();
        console.log('body: [' + msg_body + ']')
        // msg_body=msg_body.toLowerCase();

        if (msg_body === '.doris' || msg_body === '. doris' || msg_body === 'doris') {
            if (bot_memory[user]['stage'] == 0) {
                //      123456789-123456789
                text = "Ola! eu sou a Doris\n *IA de Atendimento*";
                text = text + "\nSeu perfil é de *" + perfies[perfil] + "*\nno local:" + locais[local];
                msg.reply(text);
                // client.sendMessage(msg.from, text);
                bot_memory[user]['stage'] = 1;
                bot_memory[user]['last_action'] = new Date().toString()
                asyncResetOptions(opcoes_perfil, perfil);
            } else {
                text = "Doris Destativada!!";
                // msg.reply(text);
                client.sendMessage(msg.from, text);
                bot_memory[user]['stage'] = 0;
                bot_memory[user]['last_action'] = new Date().toString()
            }
        }
        else if (bot_memory[user]['stage'] >= 1) {
            if (msg_body == '1') {
                bot_memory[user]['stage'] = 1001;
            } else if (msg_body == '0') {
                asyncResetOptions(opcoes_perfil, perfil);
                bot_memory[user]['stage'] = 1;
            }
            else if (msg_body == '..') {
                text = '123456789-123456789-123456789-123456789-123456789-123456789-123456789-'
                client.sendMessage(msg.from, text);
                text = '```123456789-123456789-123456789-123456789-123456789-123456789-123456789-```'
                client.sendMessage(msg.from, text);
            } else {
                if (bot_memory[user]['stage'] <= 100) {
                    text = 'Opção não disponível!'
                    client.sendMessage(msg.from, text);
                    asyncResetOptions(opcoes_perfil, perfil);
                    bot_memory[user]['stage'] = 1;
                }
            }
            // Processamento por Estágio
            if (bot_memory[user]['stage'] == 1001) {
                text = '```Digite``` *0* ```para opções.```\n'
                text = text + '_*Informe o código do produto:*_'
                msg.reply(text);
                bot_memory[user]['stage'] = 1002;
            } else if (bot_memory[user]['stage'] == 1002) {
                search = msg_body
                // let rawdata = fs.readFileSync('temp_codprods-138736.json');
                // textProds = GetProduto(msg.from,search,rawdata)
                sendPostRequest(msg.from, "/search_produto", search, user)

            }
        }
        else if (msg_body === 'media1') {
            const media1 = MessageMedia.fromFilePath('./icon.png');
            client.sendMessage(msg.from, media1, { caption: 'imagem' });
        }
        else if (msg_body === 'media4') {
            const media4 = MessageMedia.fromFilePath('./video.mp4');
            client.sendMessage(msg.from, media4, { caption: 'video' });
        }
        //chamada via url
        else if (msg_body === 'mediaurl') {
            const mediaUrl = await MessageMedia.fromUrl('https://static.wixstatic.com/media/f930ec_dadb21066af74a0aab01d8463ea643e8~mv2.png/v1/fill/w_92,h_128,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Sologo.png');
            client.sendMessage(msg.from, mediaUrl, { caption: 'imagem' });
        }

    }

});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
    console.log('SMW Bot ' + bot_version + ' - Aplicativo rodando na porta *: ' + port);
});
