# questal

![![Downloads](https://img.shields.io/endpoint?url=https%3A%2F%2Fsrcer.com%2Fshields%2FQuestal%2FDownloads%2Fsuccess)](https://img.shields.io/npm/dt/questal?style=plastic)
![![Version](https://img.shields.io/endpoint?url=https%3A%2F%2Fsrcer.com%2Fshields%2FQuestal%2FVersion%2Finformational)](https://img.shields.io/npm/v/questal?style=plastic)
![![Size](https://img.shields.io/endpoint?url=https%3A%2F%2Fsrcer.com%2Fshields%2FQuestal%2FSize%2Finformational)](https://img.shields.io/bundlephobia/min/questal?style=plastic)
![![License](https://img.shields.io/endpoint?url=https%3A%2F%2Fsrcer.com%2Fshields%2FQuestal%2FLicense%2Fgreen)](https://img.shields.io/npm/l/questal?style=plastic)  

A Javascript library for making HTTP requests from window or module using the same basic syntax. `Questal` will dynamically detect the environment so you can seamlessly make any request using the same commands.

Install
-------
```console
npm install questal
```

Include
-------
```javascript
const Questal = require('questal');
```
In HTML
-------
```html
<!-- The old-fashioned way -->
<script type="text/javascript" src="/node_modules/dist/questal.min.js"></script>

<!-- By Es6 module -->
<script type="module" src="/node_modules/dist/questal.es.js"></script>
```
```javascript
import Questal from '.node_modules/dist/questal.es.js';
```

Basic Usage:
-------------

You can make `get`, `post`, `put`, `patch`, and `delete` requests with `Questal`, to make a quick one off request you can capitalize the first letter and call the static version of the method, or you can set more customized options by instantiating a new `Questal` instance:
:
```javascript
//static request
Questal.Get('/path/to/dest', data => {
    console.log(data)
});

//using full Get method instance
const q = new Questal();  
let getInstance = q.get(options);
// do stuff
getInstance.send(url, data);
```
Pass parameters into the Questal constructor to have them persist through every call made by that instance, then optionally override a parameter on any individual call:
```javascript
let post = q.post(
    {
        url:'/data',
        data: {
            id:16,
            first: 'Bill',
            last: 'Jones',
        }
    }
);

//Parameters sent: { url:'/data', data: { id:16, first:'Bill', last: 'Jones' } }
post.send();  

//Parameters sent: { url:'/params', data: { id:17, first:'Bill', last: 'Nelson' } }
post.send('/params', { id:17, last:'Nelson' });  
```

Callbacks
---------
```javascript
//static post request
Questal.Post('/path/to/dest', function(data) { console.log(data, data.json)});
```
The data parameter passed to the 'on success' callback is a Questal Response object containing the results of the request, including some handy methods for accessing the data.

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

Headers
-------
Set or append header properties and they'll automatically be sent after open, for other tasks intended to run on `readyState == 1`, use `questal.on('ready', callback)`

```javascript
let post = q.post('/data')

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
post.send({ mykey: myValue });
```

Put and Delete
--------------
Turn the results of a request into its own file using the `put` method
```javascript
let get = q.get('/path/to/dest');
get.on('success', (res) => {
    q.put('/data/data2.json', { file: res.text });
});

get.send();
```
Then later delete that file using the delete method
```javascript
 q.delete('/data/data2.json', res => (alert(res.text)));
```

Running `npm run test-server` will let you see some of these examples in action locally on `localhost:8080` or `127.0.0.1:8080` in your browser.

# Changelog

Version 4
---------
Starting with Version 4 Questal supports server-side node requests as well as the browser-based requests it's always had. The syntax is all the same so you probably won't notice a difference, but if you only want to include what you're going to use and have no need for both subpackages, we've still got you covered.   

The built files in the `/dist` directory are intended for browser-based requests only and do not include any of the server-side request files. Importing or using a script tag directly from the `/dist` directory will get you the browser-only version.

However if you're using a service like `Babel` to `import Questal from 'questal'` pre-build, that version defaults to the full module containing all subpackages. So in case you know that you just need to make browser-based requests or that you just need to make server-side requests and have no need for both packages, the module exposes both packages individually using the static `QuestalAjax` and `QuestalNode` properties. 

```javascript
const { QuestalAjax } = require('questal') //Uses only the browser-based version

const { QuestalNode } = require('questal') //Uses only the Node-based version
```

Alternatively, `Questal` uses sister package [Requestal](https://www.npmjs.com/package/requestal) under the hood for Node-based requests, so if you feel you have no need whatsoever for browser-based requests, you can always install `Requestal` directly.