const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const spawn = require("child_process").spawn;
const fs = require('fs');

var {devFlightData} = require('./dev-flight-data.js');

let flights = [];

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


let newFlightData = (nfd) => {
  // Prepare flights and make dict
  let dict = {}
  for(let i=0; i<flights.length; i++) {
    flights[i].updated = false;
    flights[i].stl = flights[i].last;

    dict[flights[i]["icao24"]] = i;
  }

  // Update existing flights
  const updateTime = nfd.time;
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;

    if(!(icao24 in dict)) {
      flights.push({});
      dict[icao24] = flights.length - 1;
    }

    flights[dict[icao24]].last = nfd.states[i];
    flights[dict[icao24]].latest = nfd.states[i];
    flights[dict[icao24]].lastUpdated = updateTime;
    flights[dict[icao24]].updated = true;
    flights[dict[icao24]].icao24 = icao24;
  }
  
  io.emit('nfd', flights);

  console.log("Flights length: " + Object.keys(flights).length)
}


/*
setInterval(() => {
    const child = spawn('python',["get-data.py"]);
    child.addListener('close', (e) => {
      let rawdata = fs.readFileSync('curr-flights.json');
      let nfd = JSON.parse(rawdata);

      newFlightData(nfd)
    });
    child.addListener('error', (e) => console.error(e));
    }, 10000)
*/

devFlightData("test-data-50.json", newFlightData)
