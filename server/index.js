const spawn = require("child_process").spawn;
const fs = require('fs');

var {devFlightData} = require('./test-data/dev-flight-data.js');
var {newFlightData} = require('./src/flight-tracker.js');
var {faa} = require('./src/aircraft-info.js');
var {express, app, http, server, io} = require('./src/web.js')

/*
setInterval(() => {
    const child = spawn('python',["database/get-data.py"]);
    child.addListener('close', (e) => {
      let rawdata = fs.readFileSync('database/curr-flights.json');
      let nfd = JSON.parse(rawdata);

      newFlightData(nfd)
    });
    child.addListener('error', (e) => console.error(e));
    }, 10000)
*/

//devFlightData("test-data/test-data-50.json", newFlightData);

