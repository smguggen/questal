import Questal from './questal.js';

//static get request
Questal.Get('/data', function(data, event) {console.log(data.json)});

//static post request
Questal.Post('/data', function(data, event) { console.log(data, event)});

//get request using Questal instance
let q = new Questal();
let get = q.get({url:'/data', success: function(data) { console.log(this, data.json)} });
get.send();

//post request using questal instance
let post = q.post(
    {
        url:'/data',
        success: function(data) {
            console.log(this);
            let table = document.getElementById('table');
            let rows = data.json.join('');
            table.innerHTML = rows;
        }
});

post.on('ready', () => {
    post.headers.accept = 'json'; //adds 'application/json' to accept headers to be set
    post.headers.encoding = 'multipart'; // sets Content-Type to 'multipart/form-data'
    post.response.type = 'json'; //sets response type to application/json
});

post.on('responseHeaders', (headers) => { // when readystate == 2
    if (post.response.headers.contentType == 'application/json') {
        console.log(headers); //print questal response header object to console
    }
});

post.send();

