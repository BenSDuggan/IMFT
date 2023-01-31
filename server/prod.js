
process.env.IMFT_ENV = "developer";

var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
let { logger } = require('./src/logger.js')
let { } = require('./src/twitter.js');
const config = require('./src/config.js')
const adsb = require('./src/adsb.js')


logger.info(process.env.IMFT_VERSION + ": " + process.env.IMFT_ENV)
logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', function() {
  logger.info("Production server stopping");

  process.exit();
});

adsb.receiver = new adsb.OpenSky();
adsb.receiver.start();
