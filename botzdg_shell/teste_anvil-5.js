const axios = require('axios').default;

var username = "api";
var password = "smw1329";

var headers = {
    'Content-Type': 'application/json'
};
var url_main='https://opl-smw.sa.ngrok.io/_/api';


const sendPostRequest = async (url_sufix,search,user,filial="",almox="") => {
    // var url_sufix='/search_produto';
    var url_full=url_main+url_sufix;
    var options = {
        method: 'post',
        baseURL:url_main,
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
        resp = await axios.post(url_full, newPost,options );
        rawdata = resp.data
        showdata(rawdata)
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

function showdata(data) {
    console.log(data);
}
searchStr="138736"
user="teste"
sendPostRequest("/search_produto",searchStr,user);