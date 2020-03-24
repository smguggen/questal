# questal

A lightweight wrapper for easily making HTTP requests.

Install
-------
```javascript
npm install questal
```

Include
-------

```html
<script type="text/javascript" src="/node_modules/dist/questal.min.js"></script>
```
Basic Usage:
-------------
You can make get and post requests with standard config by calling questal's static methods.
```javascript
//static get request
Questal.Get('/path/to/dest', function(data, event) {console.log(data)});

//static post request
Questal.Post('/path/to/dest', function(data, event) { console.log(data.json)});
```
The data parameter passed to the 'on success' callback is a Questal Response object containing the results of the request.

#### data:
```javascript
QuestalResponse {
    defaultType: "text",
    settings: XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 60000, withCredentials: false, upload: XMLHttpRequestUpload, …},
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

To set more customized options grab a new instance of the object
```javascript
const q = new Questal();

//post request using questal instance
let post = q.post(
    {
        url:'/data',
        success: function(data) {
            let table = document.getElementById('table');
            let rows = data.json.join('');
            table.innerHTML = rows;
        }
});

//set or append header properties and they'll automatically be sent after open, for other tasks intended to run on readyState == 1, use questal.on('ready', callback)
post.headers.accept = 'json'; //adds 'application/json' to acceptheaders to be set
post.headers.encoding = 'multipart'; // sets Content-Type to 'multipart/form-data'
post.response.type = 'json'; //sets response type to application/json
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

```javascript
//get request using Questal instance
let get = q.get({url:'/path/to/dest', success: (data, event) => console.log(data) });

// Turn the results of the request into its own file using Questal.prototype.put
get.on('success', (res) => {
    q.put('/data/data2.json', {file: res.text});
});

get.send();

//add an event handler to delete the new file
document.getElementById('btn').addEventListener('click', function() {
    q.delete('/data/data2.json', res => (alert(res.text)));
});
```