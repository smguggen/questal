import Questal from './questal.js';
Questal.get('data.json', (data, event) => {console.log('worked', data, event)});
Questal.get('data.json', (data) => {console.log(data.json)});
