import Questal from './questal.js';
Questal.get('data.json', (data) => {console.log(data)});
Questal.get('data.json', (data) => {console.log(data.json)});
