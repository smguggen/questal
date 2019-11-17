const server = require('express');
const app = server();

app.use(server.static('./example'));


app.listen(3000)