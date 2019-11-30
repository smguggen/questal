import Questal from './questal.js';

//static get request
Questal.get('data.json', function(data, event) {console.log(data, event)});

//static post request
Questal.post('/data', function(data, event) { console.log(data.json)});

//get request using Questal instance
let q = new Questal();
let get = q.Get({url:'data.json', success: function(data) { console.log(this, data.json)} });
get.send();

//post request using questal instance
let post = q.Post({url:'/data', success: function(data) { console.log(this, data.json)} });

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

