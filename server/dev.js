// Node entrypoint for development

const utils = require('./src/utils.js')

process.env.IMFT_ENV = utils.config.env ?? "development";
process.env.IMFT_VERSION = utils.config.version ?? "vUnknown"

const { logger } = require('./src/logger.js')
const adsb = require('./src/adsb.js')
const {database} = require('./src/database.js')
var { } = require('./src/sockets.js')


logger.info(process.env.IMFT_VERSION + ": " + process.env.IMFT_ENV)
logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', async () => {
  logger.info("Server stopping...");
  await database.disconnect();

  logger.info("Server stopped");

  process.exit();
});



let historic = () => {
  adsb.receiver = new adsb.HistoricFlights()
  adsb.receiver.load("test-data/test-data-100.json");
  setTimeout(() => {
    adsb.receiver.speed = 10;
    adsb.receiver.set_frame(0);
    adsb.receiver.start();
  }, 1000)
}

historic();
