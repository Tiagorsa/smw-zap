var request = require('request'),
    username = "api",
    password = "smw1329",
    url = "http://" + username + ":" + password + "@opl-smw.sa.ngrok.io/_/api/search_produto";

var jsonDataObj = { "SearchProd": "13", "User": "teste" }
request.post(
    {
        url: url,
        body: JSON.stringify(jsonDataObj),
        json: true,
        headers: {"content-type": "application/json"}
    },
    function (error, response, body) {
        console.log(response);
    }
);
