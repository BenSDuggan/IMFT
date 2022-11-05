const spawn = require("child_process").spawn;
const fs = require('fs');

var {devFlightData} = require('./test-data/dev-flight-data.js');
var {newFlightData} = require('./src/flight-tracker.js');
var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
var {express, app, http, server, io} = require('./src/web.js')


database.connect().then((result1) => {
  console.log("Connected to the database")
  return database.get_hospitals()
}).then((result2) => {
  console.log("Got Hospitals")
  console.log(result2)
})



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

