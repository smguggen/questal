import Questal from './questal.js';
Questal.get('data.json', function(data, event) {console.log(this, data, event)});
Questal.get('data.json', (data) => {console.log(data.json)});
