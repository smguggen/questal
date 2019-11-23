# questal
  [![NPM Version][npm-image]][npm-url]


A lightweight wrapper for making HTTP requests.

*note*: You can support this project on patreon: <a target="_blank" rel="nofollow" href="https://www.patreon.com/fabiosantoscode"><img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" alt="patron" width="100px" height="auto"></a>. Check out [PATRONS.md](https://github.com/terser/terser/blob/master/PATRONS.md) for our first-tier patrons.

Terser recommends you use RollupJS to bundle your modules, as that produces smaller code overall.

*Beautification* has been undocumented and is *being removed* from terser, we recommend you use [prettier](https://npmjs.com/package/prettier).

Find the changelog in [CHANGELOG.md](https://github.com/terser/terser/blob/master/CHANGELOG.md)



[npm-url]: https://npmjs.org/package/questal

Install
-------
    npm install questal


Include
-------

Using node
    const questal = require('questal')

Using script
    ```javascript
    <script type="text/javascript" src="/node_modules/dist/questal.min.js"></script>
    ```
Basic Usage:
-------------
You can make get and post requests with standard config by calling Questal.get or Questal.post statically.
Example:
```javascript
Questal.get('/path/to/dest', (data) => {console.log(data)});
Questal.post('/path/to/dest', (data) => {console.log(data.json)});
```
The data parameter passed to the callback is a Questal Response object containing the results of the request.
```javascript
//data
QuestalResponse Object

//data.json
Array(1):
0:
names: Array(3)
0: {id: 1, first: "Bill", last: "Jones"}
1: {id: 2, first: "Jane", last: "Smith"}
2: {id: 3, first: "Bob", last: "Davis"}
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

*note*: In beta, watch this file for updates.