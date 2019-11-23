# questal

A lightweight wrapper for making HTTP requests.

Install
-------
```javascript
npm install questal
```

Include
-------

Using node
```javascript
const questal = require('questal');
```

In file
```html
<script type="text/javascript" src="/node_modules/dist/questal.min.js"></script>
```
Basic Usage:
-------------
You can make get and post requests with standard config by calling Questal.get or Questal.post statically.
```javascript
Questal.get('/path/to/dest', (data) => {console.log(data)});
Questal.post('/path/to/dest', (data) => {console.log(data.json)});
```
The data parameter passed to the callback is a Questal Response object containing the results of the request.

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
// returns new Questal Get Object
let get = Questal.Get();

// returns new Questal Post Object
let post = Questal.Post();

//after request is opened but before request is sent, set 'Accept' header to 'application/json'
post.on('send', () => {
    post.accept = 'json';
});
```

*note*: In beta, watch for updates