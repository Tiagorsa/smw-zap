var request = require('request');

var headers = {
    'Content-Type': 'application/json'
};

var dataString = '{"SearchProd":"138736","User":"teste"}';

var options = {
    url: 'https://opl-smw.sa.ngrok.io/_/api/search_produto',
    method: 'POST',
    headers: headers,
    body: dataString,
    auth: {
        'user': 'api',
        'pass': 'smw1329'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        // console.log(body);
        return body;
    }
    return {};
}

data=request(options, callback);
console.log('Post data')
console.log(data)