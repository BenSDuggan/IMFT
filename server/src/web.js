/* Set up the web server and sockets
 * 
 */

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const logger = require('./logger.js');
const io = new Server(server);

const { logger } = require('./logger.js')
const { twitter } = require('./twitter.js')

//app.use(express.static('.'))

app.get('/twitter', (req, res) => {
  twitter.get_twitter_auth_link().then((link) => {
    res.status(200).send('<h1>Twitter bot log in</h1><a href="'+link+'">Log into twitter to tweet locations</a>');
  })
});

app.get('/callback', (req, res) => {
  const { state, code } = req.query;

  twitter.twitter_auth_callback(state, code)
  .then((success) => {
    if(success) {
      res.status(200).send('<h1>Success!</h1><a href="127.0.0.1:4000/twitter>Log in again</a>');
    }
    else {
      res.status(200).send('<h1>Failed.</h1><a href="127.0.0.1:4000/twitter>Log in again</a>');
    }
  })
});

io.on('connection', (socket) => {
  
  socket.on('disconnect', () => {

  });
});


server.listen(4000, () => {
  logger.info('listening on *:4000');
});


exports.express = express;
exports.app = app;
exports.http = http;
exports.server = server;
exports.io = io;