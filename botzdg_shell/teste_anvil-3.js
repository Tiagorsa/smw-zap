var request = require('request');
var username = "api";
var password = "smw1329";
var url = "http://" + username + ":" + password + "@opl-smw.sa.ngrok.io/_/api/search_produto";



request.post(
    //First parameter API to make post request
    url,

    //Second parameter DATA which has to be sent to API
    { json: {
        SearchProd: "13",
        User: "test"
      } 
    },
    
    //Thrid parameter Callack function  
    function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 201) {
            console.log(body);
        }
    }
);