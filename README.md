# questal

A lightweight wrapper for making HTTP requests.

Install
-------
```javascript
npm install questal
```

Include
-------

#### Using node:
```javascript
const questal = require('questal');
```

#### In file:
```html
<script type="text/javascript" src="/node_modules/dist/questal.min.js"></script>
```
Basic Usage:
-------------
You can make get and post requests with standard config by calling questal's static methods.
```javascript
//static get request
Questal.get('/path/to/dest', function(data, event) {console.log(data)});

//static post request
Questal.post('/path/to/dest', function(data, event) { console.log(data.json)});
```
The data parameter passed to the 'on success' callback is a Questal Response object containing the results of the request.

#### data:
```javascript
QuestalResponse {
    defaultType: "text",
    sender: XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 60000, withCredentials: false, upload: XMLHttpRequestUpload, …},
    types: (5) ["arraybuffer", "blob", "document", "text", "json"],
    code: {…},
    data: {…},
    html: "…",
    json: {…},
    result: {…},
    status: "…",
    type: "…",
    url: "…",
    xml: "…",
}
```

#### data.json:
```json
"names": [
    {
        "id": 1,
        "first": "Bill",
        "last": "Jones"
    },
    {
        "id":2,
        "first":"Jane",
        "last":"Smith"
    },
    {
        "id":3,
        "first":"Bob",
        "last":"Davis"
    }
]
```

To set more customized options grab a new instance of the proper object
```javascript
const q = new Questal();

//get request using Questal instance
let get = q.Get({url:'/path/to/dest', success: (data, event) => console.log(data) });
get.send();

//post request using questal instance
let post = q.Post({url:'/path/to/dest', success: (data, event) => console.log(data.json) });

//set or append header properties and they'll automatically be sent after open
post.on('ready', () => {
    post.headers.accept = 'json'; //adds 'application/json' to accept headers to be set
    post.headers.encoding = 'multipart'; // sets Content-Type to 'multipart/form-data'
    post.response.type = 'json'; //sets response type to application/json
});
```
You can check the response object's headers parameter to confirm response headers:
```javascript
post.on('responseHeaders', () => { // when readystate == 2
    if (post.response.headers.contentType != 'application/json') {
        console.log(headers); //print questal response header object to console
    }
});

//after setup, send request
post.send();
```
*note*: In beta, watch for updates