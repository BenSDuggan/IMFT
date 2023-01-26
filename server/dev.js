
process.env.IMFT_ENV = "development";

var {newFlightData} = require('./src/flight-tracker.js');
var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
let { logger } = require('./src/logger.js')
const config = require('./src/config.js')
const adsb = require('./src/adsb.js')


logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', function() {
  logger.info("Production server stopping");

  process.exit();
});



let historic = () => {
  adsb.receiver = new adsb.HistoricFlights()
  adsb.receiver.load("test-data/test-data-198.json");
  setTimeout(() => {
    adsb.receiver.speed = 2
    adsb.receiver.start()
  }, 1000)
}

//live();
historic();
