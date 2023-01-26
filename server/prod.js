
process.env.IMFT_ENV = "developer";

var {database} = require('./src/database.js')
var { } = require('./src/sockets.js')
let { logger } = require('./src/logger.js')
let { } = require('./src/twitter.js');
const config = require('./src/config.js')
let {OpenSky} = require('./src/adsb.js')


logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', function() {
  logger.info("Production server stopping");

  process.exit();
});

let opensky = new OpenSky();
opensky.start();
opensky.clean_data();
