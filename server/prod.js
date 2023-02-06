// Node entrypoint for production

const utils = require('./src/utils.js')

process.env.IMFT_ENV = utils.config.env ?? "production";
process.env.IMFT_VERSION = utils.config.version ?? "vUnknown"

const { logger } = require('./src/logger.js')
const adsb = require('./src/adsb.js')
const {database} = require('./src/database.js')
var { } = require('./src/sockets.js');
const { twitter } = require('./src/twitter.js');


logger.info(process.env.IMFT_VERSION + ": " + process.env.IMFT_ENV)
logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', async () => {
  logger.info("Server stopping...");
  await database.disconnect();

  logger.info("Server stopped");

  process.exit();
});

twitter.read_only = true;;

adsb.receiver = new adsb.OpenSky();
adsb.receiver.start();

