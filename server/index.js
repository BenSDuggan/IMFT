const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const spawn = require("child_process").spawn;
const fs = require('fs');

let flights = {};

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


server.listen(3000, () => {
  console.log('listening on *:3000');
});


let newData = () => {
    let rawdata = fs.readFileSync('curr-flights.json');
    let nfd = JSON.parse(rawdata);

    // Prepare flights
    for(let f in flights) {
      flights[f].updated = false;
      flights[f].stl = flights[f].last;
    }

    // Update existing flights
    const updateTime = nfd.time;
    for(let i=0; i<nfd.states.length; i++) {
      const icao24 = nfd.states[i].icao24;

      if(!(icao24 in flights))
        flights[icao24] = {};

      flights[icao24].last = nfd.states[i];
      flights[icao24].latest = nfd.states[i];
      flights[icao24].lastUpdated = updateTime;
      flights[icao24].updated = true;
    }
    
    io.emit('nfd', flights);

    console.log("Flights length: " + Object.keys(flights).length)
}

/*
setInterval(() => {
    const child = spawn('python',["get-data.py"]);
    child.addListener('close', (e) => {newData()});
    child.addListener('error', (e) => console.error(e));
    }, 10000)
*/
