/*
 * Handel all of the socket requests
 */

const adsb = require('./adsb.js')
var {database} = require('./database.js')
var {flights} = require('./flight-tracker.js');
var {io} = require('./web.js')
let {logger} = require('./logger.js')
var {trips} = require('./trips.js')


io.on('connection', (socket) => {
    socket.on('get_flights', (msg) => {
        let aflights = []
        for(let f in flights.flights) {
            aflights.push(flights.flights[f])
        }
        let atrips = []
        for(let t in trips.trips) {
            atrips.push(trips.trips[t])
        }

        socket.emit('nfd', {"flights":aflights, "trips":atrips});
    });

    socket.on('get_hospitals', (msg) => {
        database.get_hospitals().then((hospitals) => {
            socket.emit('hospitals', hospitals);
        });
    });

    socket.on('get_hf_metadata', (msg) => {
        if(process.env.IMFT_ENV != "production" && process.env.IMFT_ENV == "development" && adsb.receiver.service == "historic-flights")
            adsb.receiver.emit_metadata()
    });

    socket.on('hf_action', (msg) => {
        if(process.env.IMFT_ENV == "production" && process.env.IMFT_ENV != "development" && adsb.receiver.service != "historic-flights")
            return

        logger.verbose("socket: hf_action: " + msg.action)
        if(msg.action === "start") {
            adsb.receiver.start();
        }
        else if(msg.action === "stop") {
            adsb.receiver.stop();
        }
        else if(msg.action === "speed") {
            adsb.receiver.set_speed(Number(msg.value));
        }
        else if(msg.action === "frame") {
            adsb.receiver.set_frame(Number(msg.value));
        }
        else {
            logger.warn("Received invalid message");
        }

        adsb.receiver.emit_metadata();
    })

    socket.on('get_db_trips', (msg) => {
        console.log(msg)
        // Cast dates from client
        let min_date = new Date(msg.min_date ?? new Date(new Date()-(90*24*60*60*1000)));
        let max_date = new Date(msg.max_date ?? new Date());

        trips.database_get_trip_by_date(min_date, max_date)
        .then((results) => {
            socket.emit('db_trips', results);
        })
        .catch((error) => {
            logger.warn("sockets.get_db_trips: Could not get trips using msg ["+msg+"]. " + error)
        })
    });
});



