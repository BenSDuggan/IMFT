const spawn = require("child_process").spawn;
const fs = require('fs');

var {historic_flights} = require('./test-data/dev-flight-data.js');
var {newFlightData} = require('./src/flight-tracker.js');
var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
let { logger } = require('./src/logger.js')
let { } = require('./src/twitter.js');
const config = require('./src/config.js')


logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', function() {
  logger.info("Production server stopping");

  process.exit();
});



let get_data = () => {
  const child = spawn('python3',["src/get-data.py"]);
  child.addListener('close', (e) => {
    let rawdata = fs.readFileSync('curr-flights.json');
    let nfd = JSON.parse(rawdata);

    newFlightData(nfd);
  });
  child.addListener('error', (e) => console.error(e));
}

let live = () => {
  get_data()
  setInterval(() => {
    get_data()
  }, 90 * 1000)
}

live();
//historic();
