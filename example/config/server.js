const server = require('express');
const app = server();

app.use(server.static('.'));


app.listen(3000)