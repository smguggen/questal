//static get request
Questal.Get('/data?id=14', function(data) {console.log('Static Get', data.json, 'expected params: {id:14}')});

//static post request
Questal.Post('/data', { id:15 }, function(data) {console.log('Static Post', data.json, 'expected params: {id:15}')});

//get request using Questal instance
let q = new Questal();

//post request using questal instance
let post = q.post(
    {
        url:'/data',
        data: {id:16},
        success: function(data) {
             console.log('Post', data.json);
            let table = document.getElementById('table');
            let rows = data.json.join('');
            table.innerHTML = rows;
        }
});

post.headers.accept = 'json'; //adds 'application/json' to acceptheaders to be set

post.response.type = 'json'; //sets response type to application/json

post.on('responseHeaders', (headers) => { // when readystate == 2
    if (post.response.headers.contentType == 'application/json') {
        console.log(headers); //print questal response header object to console
    }
});

post.send({id:17, last:'Nelson'});

let get = q.get('/data', {id: 18});

get.on('success', (res) => {
    console.log('Get', res.json, 'expected params: {id:18, color:green}');
    
    // Turn the results of the request into its own file using the put method
    q.put('/data/data2.json', { file: JSON.stringify(res.json, null, '\t') });
});

get.send('/data?color=green');

//add an event handler to delete the new file
document.getElementById('btn').addEventListener('click', function() {
    q.delete('/data/data2.json', res => alert(res.text));
});
