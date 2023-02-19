var request = require('request');

function getProdutERP(search) {
    var username = "api";
    var password = "smw1329";
    // var url = "https://" + username + ":" + password + "@opl-smw.sa.ngrok.io/_/api/search_produto";
    var url = "https://opl-smw.sa.ngrok.io/_/api/search_produto";

    requestData = { "SearchProd": search, "User": "teste" }
    var headers = {
        'Content-Type': 'application/json'
    };


    request.post({
        url: url,
        json: true,
        auth: {
            'user': username,
            'pass': password
        },
        headers: headers,
        body: requestData
    }, function (error, response, body) {
        // console.log(response);
        console.log(body);
        return body;
    });
    return {}
}


data=getProdutERP("13")
console.log(data);