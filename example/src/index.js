import Questal from './questal.js';
import Components from './components.js';
import React from "react";
import ReactDOM from "react-dom";

//Example uses React to create Dom Elements
let rows = [];
//static get request
Questal.Get('/data', function(data, event) {console.log(data.json)});

//static post request
Questal.Post('/data', function(data, event) { console.log(data, event)});

//get request using Questal instance
let q = new Questal();

//post request using questal instance
let post = q.post(
    {
        url:'/data',
        success: function(data) {
            console.log(this);
            rows = data.json;
            onReady();
        }
});

post.headers.accept = 'json'; //adds 'application/json' to acceptheaders to be set
post.headers.encoding = 'multipart'; // sets Content-Type to 'multipart/form-data'
post.response.type = 'json'; //sets response type to application/json

post.on('responseHeaders', (headers) => { // when readystate == 2
    if (post.response.headers.contentType == 'application/json') {
        console.log(headers); //print questal response header object to console
    }
});

post.send();

let get = q.get({url:'/data', success: function(data) { console.log(this, data.json)} });

get.on('success', (res) => {
    // Turn the results of the request into its own file using the put method
    q.put('/data/data2.json', {file: res.text});
});

get.send();

//add an event handler to delete the new file
let clickEvent = () => q.delete('/data/data2.json', res => alert(res.text));

function onReady() {
    ReactDOM.render(<Components.App>
        <Components.Button id="deleteBtn" clickEvent={clickEvent}>Delete</Components.Button>
        <Components.Table id="table" rows={rows} />
        <Components.Module src="index.js"/>
    </Components.App>, document.getElementById('container'));
}

