/* Set up the web server and sockets
 * 
 */

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const { env } = require('process');
const { Server } = require("socket.io");

const { logger } = require('./logger.js')
var {trips} = require('./trips.js')
const { twitter } = require('./twitter.js')

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//app.use(express.static('.'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/twitter', (req, res) => {
  twitter.get_twitter_auth_link().then((link) => {
    res.status(200).send('<h1>Twitter bot log in</h1><a href="'+link+'">Log into twitter to tweet locations</a>');
  })
});

app.get('/callback', (req, res) => {
  const { state, code } = req.query;

  twitter.twitter_auth_callback(state, code)
  .then((success) => {
    if(success && success.success) {
      res.status(200).send('<h1>Success!</h1><p>'+success.message+'</p><a href="127.0.0.1:4000/twitter>Log in again</a>');
    }
    else {
      res.status(200).send('<h1>Failed.</h1><p>'+success.message+'</p><a href="127.0.0.1:4000/twitter>Log in again</a>');
    }
  })
});


/*********************
 ***   Trips API   ***
 ********************/

app.get('/api/version', (req, res) => {
  res.status(200).json({"version":process.env.IMFT_VERSION})
});

app.get('/api/trip/:tid', (req, res) => {
  console.log(req.params)
  let options = {tid:req.params.tid};

  trips.database_get_trip(options)
  .then((results) => {
    res.status(200).json(results)
  })
  .catch((error) => {
      logger.warn("web./api/trip:trips.database_get_trip(): Could not get trips using options ["+JSON.stringify(options)+"]. " + String(error))
  })

  //res.status(200).json({"version":process.env.IMFT_VERSION})
});

app.post('/api/trips', (req, res) => {
  // Cast dates from client
  let max_date = new Date(req.body.max_date ?? new Date());
  let min_date = new Date(req.body.min_date ?? new Date(new Date()-(90*24*60*60*1000)));

  let options = {min_date:min_date, max_date:max_date};

  trips.database_get_trip(options)
  .then((results) => {
    results = results.map((result) => {
      result.path = []
      return result;
    })
    res.status(200).json(results)
  })
  .catch((error) => {
      logger.warn("web./api/trips:trips.database_get_trip(): Could not get trips using options ["+JSON.stringify(options)+"]. " + String(error))
  })

  //res.status(200).json({"version":process.env.IMFT_VERSION})
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