/* Set up the web server and sockets
 * 
 */

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(express.static('.'))
/*
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
*/

io.on('connection', (socket) => {
  
  socket.on('disconnect', () => {

  });
});


server.listen(4000, () => {
  console.log('listening on *:4000');
});


exports.express = express;
exports.app = app;
exports.http = http;
exports.server = server;
exports.io = io;