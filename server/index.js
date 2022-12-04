const spawn = require("child_process").spawn;
const fs = require('fs');

var {historic_flights} = require('./test-data/dev-flight-data.js');
var {newFlightData} = require('./src/flight-tracker.js');
var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
let { logger } = require('./src/logger.js')

logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', function() {
  logger.info("Production server stopping");

  process.exit();
});


let get_data = () => {
  const child = spawn('python',["src/get-data.py"]);
  child.addListener('close', (e) => {
    let rawdata = fs.readFileSync('curr-flights.json');
    let nfd = JSON.parse(rawdata);

    newFlightData(nfd);
  });
  child.addListener('error', (e) => console.error(e));
}

get_data()
setInterval(() => {
  get_data()
}, 30 * 1000)

/*

historic_flights.load("test-data/test-data-50_2.json");
setTimeout(() => {
  historic_flights.speed = 2
  historic_flights.start()
}, 1000)
*/