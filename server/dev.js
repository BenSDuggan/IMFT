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

let trip1 = {"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":1669923349,"lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":1669923944,"lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[]};

let trip2 = {"tid":"4d5361a3-9f19-4109-8e22-a3e7c8f26383","aid":"a1709e","status":"los","departure":{"lid":"IN73","type":"faaLID","display_name":"CLARION NORTH MEDICAL CENTER","time":1669923726,"lat":39.9499,"lon":-86.1654,"distance":3647.4668201352993},"arrival":{"lid":"indianapolis_heliport","type":"hospital","display_name":"Indianapolis Heliport / IUH University","time":1669924377,"lat":39.7663,"lon":-86.1448,"distance":1110.2771365133844},"stats":{"time":350,"distance":67852.6470880894},"path":[[39.9499,-86.1654],[39.9499,-86.1654],[39.937,-86.1621],[39.9335,-86.1613],[39.9252,-86.1597],[39.9252,-86.1597],[39.9177,-86.1587],[39.9101,-86.1577],[39.9043,-86.1569],[39.8997,-86.1564],[39.8946,-86.1559],[39.8889,-86.1552],[39.8889,-86.1552],[39.8726,-86.1533],[39.8663,-86.1525],[39.8605,-86.152],[39.8563,-86.1517],[39.8486,-86.1508],[39.843,-86.15],[39.8374,-86.1492],[39.8277,-86.1479],[39.8231,-86.1472],[39.8154,-86.1459],[39.8098,-86.1451],[39.8034,-86.1445],[39.7973,-86.1437],[39.7943,-86.1432],[39.7869,-86.1419],[39.7822,-86.1411],[39.7767,-86.1405],[39.7717,-86.1404],[39.7695,-86.141],[39.7669,-86.1435],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448]]};

let terms = {"departure.time": {$gte: new Date(1669923726*1000)}}

const {trips} = require('./src/trips.js')

/*
trips.database_add_trip(trip2)
.then((result) => {
  console.log(result)
})
.catch((error) => {
  console.log(error)
})
*/

/*
let a = new Date();
trips.database_get_aid_index(new Date(1669923726*1000), new Date(1669923944*1000))
.then((result) => {
  console.log((new Date()).getTime() - a.getTime())
  console.log(result);
  console.log(result.length)
})
.catch((error) => {
  console.log(error)
})
*/

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
