// Node entrypoint for development

const utils = require('./src/utils.js')

process.env.IMFT_ENV = utils.config.env ?? "development";
process.env.IMFT_VERSION = utils.config.version ?? "vUnknown"

const { logger } = require('./src/logger.js')
const adsb = require('./src/adsb.js')
const {database} = require('./src/database.js')


logger.info(process.env.IMFT_VERSION + ": " + process.env.IMFT_ENV)
logger.info("Production server started")

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', async () => {
  logger.info("Server stopping...");
  await database.disconnect();

  logger.info("Server stopped");

  process.exit();
});

let trip = {"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":1669923349,"lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":1669923944,"lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[]};

let terms = {"stats.time":594}

database.get_trip(terms)
.then((result) => 
  {//console.log(result)
  })
.catch((error) => {
  console.log(error)
})

let historic = () => {
  adsb.receiver = new adsb.HistoricFlights()
  adsb.receiver.load("test-data/test-data-100.json");
  setTimeout(() => {
    adsb.receiver.speed = 10
    adsb.receiver.set_frame(0);
    adsb.receiver.start();
  }, 1000)
}

historic();
