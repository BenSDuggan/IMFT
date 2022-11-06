const spawn = require("child_process").spawn;
const fs = require('fs');

var {devFlightData} = require('./test-data/dev-flight-data.js');
var {newFlightData} = require('./src/flight-tracker.js');
var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')


database.connect().then((result1) => {
  console.log("Connected to the database")
  return database.get_hospitals()
}).then((result) => {
  console.log("Got Hospitals: " + result.length)
})

/*
setInterval(() => {
  const child = spawn('python',["src/get-data.py"]);
  child.addListener('close', (e) => {
    let rawdata = fs.readFileSync('curr-flights.json');
    let nfd = JSON.parse(rawdata);

    newFlightData(nfd);
  });
  child.addListener('error', (e) => console.error(e));
}, 10 * 1000)
*/

//devFlightData("test-data/test-data-50.json", newFlightData);

