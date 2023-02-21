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

const { WebhookClient } = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const util = require("util");
const { struct } = require('pb-util');
const fs = require("fs");


const axios = require('axios').default;

// const dateFormat = require('dateformat');

// Port Service
const port = 8000;
const idClient = 'bot-smw001';
const bot_version = 'v 0.230.2.21 rev-1526'
const currency = require("currency.js");

const REAL = value => currency(value, { symbol: 'R$', decimal: ',', separator: '.' });
const SALDO = value => currency(value, { symbol: '', decimal: ',', separator: '.' });

// CREDENCIAIS DIALOGFLOW (https://console.cloud.google.com/)
const sessionClient = new dialogflow.SessionsClient({ keyFilename: 'assets/doris-agenda-lxfgac-cd1481f4243c.json' });
const projectID = 'doris-agenda-lxfgac';
const languageProjectID = 'pt-br';

bot_memory = {};

// Remote Acess SMW Anvil ERP API
const username = "api";
const password = "smw1329";
const headers = { 'Content-Type': 'application/json' };
const url_main = 'https://opl-smw.sa.ngrok.io/_/api';

const perfies = { 1: 'VENDEDOR', 2: 'GERENTE-VENDA', 3: 'GERENTE-COMPRA',4: 'GERENTE-GERAL', 9: 'DIRETOR' }
const locais = { 1: 'MATRIZ', 30: 'Exclusive', 40: 'Pariguis', 70: 'JC', 75: 'BR' }
const opcoes_perfil = { 1: { 
        'menu': '*1*```-Consulta Produto p./cod.```\n*2*```-Consulta Produto c/imagem```'
        , 'options': {"1":1001,"2":1002}
        , 'available_options': [1,2] } 
    }


// FUNÇÕES DIALOGFLOW UTIL
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

// FUNÇÕES DIALOGFLOW
async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}
async function executeQueries(projectId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Pergunta: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            //console.log('Enviando Resposta');
            if (isBlank(intentResponse.queryResult.fulfillmentText)) {
                console.log('Sem resposta definida no DialogFlow');
                return null;
            }
            else {
                console.log('Resposta definida no DialogFlow');
                //console.log(intentResponse.queryResult.fulfillmentText);
                return `${intentResponse.queryResult.fulfillmentText}`
            }
        } catch (error) {
            console.log(error);
        }
    }
}
async function detectIntentwithTTSResponse(projectId,
    sessionId,
    query,
    languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );
    // The audio query request
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
        outputAudioConfig: {
            audioEncoding: 'OUTPUT_AUDIO_ENCODING_OGG_OPUS',
        },
    };
    const responses = await sessionClient.detectIntent(request);
    const audioFile = responses[0].outputAudio;
    const outputFile = './' + sessionId + '.ogg';
    util.promisify(fs.writeFile)(outputFile, audioFile, 'base64');
    console.log(`Audio content written to file: ${outputFile}`);
    return responses[0];
}
async function executeQueriesAudio(projectId, sessionId, queries, languageCode) {
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Pergunta: ${query}`);
            intentResponse = await detectIntentwithTTSResponse(
                projectId,
                sessionId,
                query,
                languageCode
            );
            if (isBlank(intentResponse.queryResult.fulfillmentText)) {
                console.log('Sem resposta definida no DialogFlow');
                return null;
            }
            else {
                console.log('Resposta definida no DialogFlow');
                //console.log(intentResponse.queryResult.fulfillmentText);
                return `${intentResponse.queryResult.fulfillmentText}`
            }
        } catch (error) {
            console.log(error);
        }
    }
}
async function detectAudioIntent(
    projectId,
    sessionId,
    filename,
    encoding,
    sampleRateHertz,
    languageCode
) {
    // Instantiates a session client
    const sessionClientAudio = sessionClient;

    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClientAudio.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // Read the content of the audio file and send it as part of the request.
    const readFile = util.promisify(fs.readFile);
    const inputAudio = await readFile(filename);
    const request = {
        session: sessionPath,
        queryInput: {
            audioConfig: {
                audioEncoding: encoding,
                sampleRateHertz: sampleRateHertz,
                languageCode: languageCode,
            },
        },
        inputAudio: inputAudio,
    };
    // Recognizes the speech in the audio and detects its intent.
    const [response] = await sessionClientAudio.detectIntent(request);

    console.log('Detected intent:');
    const result = response.queryResult;
    // Instantiates a context client
    const contextClient = new dialogflow.ContextsClient();

    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log('  No intent matched.');
    }
    const parameters = JSON.stringify(struct.decode(result.parameters));
    console.log(`  Parameters: ${parameters}`);
    if (result.outputContexts && result.outputContexts.length) {
        console.log('  Output contexts:');
        result.outputContexts.forEach(context => {
            const contextId = contextClient.matchContextFromProjectAgentSessionContextName(
                context.name
            );
            const contextParameters = JSON.stringify(
                //struct.decode(context.parameters)
            );
            console.log(`    ${contextId}`);
            console.log(`      lifespan: ${context.lifespanCount}`);
            console.log(`      parameters: ${contextParameters}`);
        });
    }
    return `${result.fulfillmentText}`
}


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

    async function asyncResetOptions(opcoes_perfil, perfil, user) {
        text = "Seu perfil é de *" + perfies[bot_memory[user]['perfil']] + '*';
        text = text + "\nno local:" + locais[bot_memory[user]['local']];
        text = text + '\n\n```Opções do Perfil:```'
        text = text + '\n' + opcoes_perfil[perfil]['menu']
        text = text + '\n*0*```-Mostrar opções```'
        text = text + '\n*.doris*```-Desativa interação```'
        bot_memory[user]['last_action'] = new Date().toString()
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

    const sendPostRequest = async (from, url_sufix, search, user, showImage, filial = "", almox = "") => {
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
        if (isNumeric(search)) {
            search = Number(search).toString()
        }

        var newPost = { "SearchProd": search, "User": user };
        if (filial) {
            newPost['Filial'] = Number(filial).toString();
        }
        if (almox) {
            newPost['Almox'] = almox;
        }
        try {
            resp = await axios.post(url_full, newPost, options);
            rawdata = resp.data
            ShowProdutos(from, search, rawdata, showImage)
            // showdata(resp.data)
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    };

    function isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    async function ShowProdutos(from, searchStr, rawdata, showImage = false) {
        // let rawdata = fs.readFileSync('temp_codprods-138736.json');
        let prods = rawdata;
        // let prods = JSON.parse(rawdata);
        var max_lengh = 27
        // numMatchs = zeroPad(prods['counter'], 5);
        numMatchs = prods['counter']
        if (numMatchs >= 1) {
            if (numMatchs == 1) {
                extra_msg = ''
                codprod = zeroPad(prods['data'][0]['codprod'], 6);
                descricao = '```' + prods['data'][0]['descricao'] + '```';
                if (showImage) {
                    urlImage = prods['data'][0]['external_image'];
                    if (urlImage) {
                        const mediaUrl = await MessageMedia.fromUrl(urlImage);
                        client.sendMessage(msg.from, mediaUrl, { caption: 'CODPROD: ' + codprod + '-' + descricao });
                    } else {
                        extra_msg = '\n*SEM IMAGEM DISPONÍVEL*'
                    }
                }
                marca = prods['data'][0]['marca'];
                ean = marca = prods['data'][0]['codauxiliar'];
                cod_dep = prods['data'][0]['codepto'];

                preco = REAL(prods['data'][0]['preco_orig_win']).format();
                saldo_geral = Number(prods['data'][0]['saldo_geral'])
                saldo_filial_almox = prods['data'][0]['saldo_filial_almox'];
                saldo_filial = Number(prods['data'][0]['saldo_filial']);
                fator = Number(prods['data'][0]['fator']);
                unid = prods['data'][0]['unid']
                codepto = prods['data'][0]['codepto']
                data_captura = prods['data'][0]['data_captura']


                rtnText = 'Achei ' + numMatchs;
                rtnText = rtnText + ' p/Busca [' + searchStr + '] em '+data_captura;
                rtnText = rtnText + '\n```' + '-'.repeat(max_lengh) + '```';
                rtnText = rtnText + '\nDescrição:\n' + descricao;
                rtnText = rtnText + '\n\n```Código: ```' + codprod+'/'+codepto;
                rtnText = rtnText + '\n```   EAN: ```' + ean;
                rtnText = rtnText + '\n``` Preço: ```' + preco+'/'+unid;
                if (fator!=1 && unid=='M2') {
                rtnText = rtnText + '\n```CX com: ```' + fator+'m2';
                }
                if (saldo_geral == 0) {
                    rtnText = rtnText + '\n*Produto sem SALDO*';
                } else {
                                       //123456789-123456789-123456
                    rtnText = rtnText + '\n__ SALDO _______________'
                    rtnText = rtnText + '\n*SALDO GERAL:* ' + SALDO(saldo_geral) + unid;
                    com_saldo_filiais = prods['data'][0]['com_saldo_filiais'];
                    tempStrBuffer = '';
                    Object.keys(com_saldo_filiais).forEach(function (key) {
                        // console.log('Key : ' + key + ', Value : ' + com_saldo_filiais[key])
                        tempStrBuffer = tempStrBuffer + '  ' + key + '=' + com_saldo_filiais[key] + unid + '\n'
                    })
                    rtnText = rtnText + '\n' + tempStrBuffer;

                    if (saldo_filial > 0) {
                        // rtnText = rtnText + '\n*SALDO LOJA:* ' + SALDO(saldo_filial_almox) + unid;
                        rtnText = rtnText + '\n*SALDO LOJA:* ' + SALDO(saldo_filial_almox) + unid;
                        if (saldo_filial_almox>0) {
                            rtnText = rtnText +  SALDO(saldo_filial_almox) + unid;
                        }
                        saldo_almox = prods['data'][0]['saldo_almox'];
                        tempStrBuffer = ''
                        Object.keys(saldo_almox).forEach(function (key) {
                            // console.log('Key : ' + key + ', Value : ' + com_saldo_filiais[key])
                            tempStrBuffer = tempStrBuffer + '  ' + key + '=' + saldo_almox[key] + unid + '\n'
                        })
                        rtnText = rtnText + '\n' + tempStrBuffer;
                        rtnText = rtnText + '*SALDO:* ' + SALDO(saldo_filial) + unid;
                    }

                }
                client.sendMessage(from, rtnText + extra_msg);
            } else {
                data_captura = prods['data'][0]['data_captura']
                rtnText = 'Achei ' + numMatchs;
                rtnText = rtnText + ' p/Busca [' + searchStr + '] em '+data_captura;
                rtnText = rtnText + '\n```' + '-'.repeat(max_lengh) + '```';
                strRows = "\n\n"
                for (var i = 0; i < prods['data'].length; i++) {
                    var prod = prods['data'][i];
                    // console.log(prod);
                    codprod = zeroPad(prod['codprod'], 8);
                    descricao = prod['descricao'];
                    codepto = prod['codepto'];
                    codauxiliar = prod['codauxiliar'];
                    saldo_filial_almox = prod['saldo_filial_almox'];
                    saldo_filial = prod['saldo_filial'];
                    saldo_geral = SALDO(Number(prod['saldo_geral']));
                    unid = prod['unid']
                    promocao = prod['promocao']
                    preco = REAL(prod['preco_orig_win']).format();

                    // descr = zeroPad((i + 1), 3) + '. ' + prod['codprod'] + ' -' + prod['descricao'];
                    // descr = zeroPad((i + 1), 3) + '.CP ' + codprod + ' -' + descricao;
                    descr = codprod + ' -' + descricao;
                    strRows = strRows + descr + '\n  Preço:' + preco + '\n  Saldo Geral: ' + saldo_geral + unid + '\n\n';
                }


                client.sendMessage(from, rtnText + strRows);

                // rows = []
                // for (var i = 0; i < prods['data'].length; i++) {
                //     var prod = prods['data'][i];
                //     // console.log(prod);
                //     descr = zeroPad((i + 1), 3) + '. ' + prod['codprod'] + '-' + prod['descricao'];
                //     preco = REAL(prods['data'][i]['preco_orig_win']).format();
                //     row = {
                //         title: descr
                //         , description: preco
                //     };
                //     rows.push(row);
                // }
                // rows=[
                //       { title: 'X-Burguer', description: 'R$5.00' }
                //     , { title: 'X-Egg', description: 'R$6.00' }
                //     , { title: 'X-Tudo', description: 'R$7.00' }]
                console.log('send list: ' + prods['data'].length)
                // sections = [{
                //     title: '© SMWBOT'
                //     , rows: rows
                // }];
                // list = new List('Lista , escolha os itens do seu pedido selecionando as opções do menu'
                //     , 'Consulta Produtos'
                //     , sections, 'Escolha o seu produto'
                //     , '© SMW-BOT');
                // client.sendMessage(from, list);
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

    cliente = 'opl';
    jsonfile_allowed = 'assets/allowed-m-' + cliente + '.json'
    console.log('Read Allowed users: ' + jsonfile_allowed);
    var rawdata = fs.readFileSync(jsonfile_allowed);
    var userDB = JSON.parse(rawdata);

    // Allow User
    var allowed_users = []
    Object.keys(userDB[cliente]["allowed"]).forEach(function (key) {
        allowed_users.push(key);
    })
    console.log('allowed_users: ' + allowed_users);

    // Monstra quem esta chamando
    console.log('Calling From: ' + user_from + ' Search User: ' + user + ' - ' + nomeContato)

    // Somente Usuários autorizados
    if (allowed_users.includes(user)) {
        if (user in bot_memory == false) {
            bot_memory[user] = {
                'active': 1
                , 'stage': 0
                , 'nome': userDB[cliente]["allowed"][user]['username']
                , 'perfil': userDB[cliente]["allowed"][user]['perfil']
                , 'local': userDB[cliente]["allowed"][user]['codfil']
                , 'depto': userDB[cliente]["allowed"][user]['coddepto']
                , 'ponto': userDB[cliente]["allowed"][user]['ponto']
                , 'screen_mobile': userDB[cliente]["allowed"][user]['size']
                , 'last_action': new Date().toString()
                , 'last_login': new Date().toString()
            };
        } else {
            // Update if change
            bot_memory[user]['nome'] = userDB[cliente]["allowed"][user]['username'];
            bot_memory[user]['perfil'] = userDB[cliente]["allowed"][user]['perfil'];
            bot_memory[user]['local'] = userDB[cliente]["allowed"][user]['codfil'];
            bot_memory[user]['depto'] = userDB[cliente]["allowed"][user]['coddepto'];
            bot_memory[user]['ponto'] = userDB[cliente]["allowed"][user]['ponto'];
        }
        console.log('    Usuário: ' + user + ' - stage: ' + bot_memory[user]['stage']);
        console.log('      Local: ' + locais[bot_memory[user]['local']] + ' perfil: ' + perfies[bot_memory[user]['perfil']]);
        console.log('last_action: ' + bot_memory[user]['last_action']);
        console.log(' last_login: ' + bot_memory[user]['last_login']);
        console.log('Curret Time: ' + new Date().toString());
        diff_hrs = Math.round(Math.abs(new Date() - new Date(bot_memory[user]['last_login'])) / 36e5);
        diff_min = Math.round(Math.abs(new Date() - new Date(bot_memory[user]['last_login'])) / 1000 / 60);
        console.log('           : h:(' + diff_hrs + ') m:(' + diff_min + ') ');

        //INTERAÇÃO DE TEXTO
        if (!msg.hasMedia || !msg.type === "ptt") {
            msg_body = msg.body.toLowerCase();
            console.log('body: [' + msg_body + ']');
            // msg_body=msg_body.toLowerCase();

            if (msg_body === '.doris' || msg_body === '. doris' || msg_body === 'doris') {
                if (bot_memory[user]['stage'] == 0) {
                    //      123456789-123456789
                    // Mensagem de Benvindo
                    text = "Olá! " + bot_memory[user]['nome'] + ",eu sou a Doris\n *IA de Atendimento*";
                    text = text + "\nver: " + bot_version;
                    // text = text + "\n\nSeu perfil é de *" + perfies[bot_memory[user]['perfil']] + "*\nno local:" + locais[bot_memory[user]['local']];
                    msg.reply(text);
                    // client.sendMessage(msg.from, text);
                    bot_memory[user]['stage'] = 1;
                    bot_memory[user]['last_action'] = new Date().toString();
                    asyncResetOptions(opcoes_perfil, bot_memory[user]['perfil'], user);
                } else {
                    text = "Doris Destativada!!";
                    // msg.reply(text);
                    client.sendMessage(msg.from, text);
                    bot_memory[user]['stage'] = 0;
                    bot_memory[user]['last_action'] = new Date().toString();
                }
            }
            else if (bot_memory[user]['stage'] >= 1) {
                if (msg_body == '1') {
                    bot_memory[user]['stage'] = 1001;
                }
                else if (msg_body == '2') {
                    bot_memory[user]['stage'] = 1002;
                }
                else if (msg_body == '0') {
                    asyncResetOptions(opcoes_perfil, bot_memory[user]['perfil'], user);
                    bot_memory[user]['stage'] = 1;
                }
                else if (msg_body == '..') {
                    text = '123456789-123456789-123456789-123456789-123456789-123456789-123456789-';
                    client.sendMessage(msg.from, text);
                    text = '```123456789-123456789-123456789-123456789-123456789-123456789-123456789-```';
                    client.sendMessage(msg.from, text);
                } else {
                    if (bot_memory[user]['stage'] <= 100) {
                        text = 'Opção não disponível!';
                        client.sendMessage(msg.from, text);
                        asyncResetOptions(opcoes_perfil, bot_memory[user]['perfil'], user);
                        bot_memory[user]['stage'] = 1;
                    }
                }
                // Processamento por Estágio
                if ([1001, 1002].includes(bot_memory[user]['stage'])) {
                    text = '```Digite``` *0* ```para opções.``` .' + bot_memory[user]['stage'] + '\n';
                    text = text + '_*Informe o código do produto:*_';
                    msg.reply(text);
                    bot_memory[user]['stage'] = bot_memory[user]['stage'] + 10;
                    bot_memory[user]['last_action'] = new Date().toString();
                } else if ([1011, 1012].includes(bot_memory[user]['stage'])) {
                    search = msg_body;
                    sendPostRequest(msg.from, "/search_produto", search, user, bot_memory[user]['stage'] == 1012,bot_memory[user]['local']);
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

    }

});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
    console.log('SMW Bot ' + bot_version + ' - Aplicativo rodando na porta *: ' + port);
});
