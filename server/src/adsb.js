// Get ADS-B data from online services

const fs = require('fs');
const path = require("path");
const spawn = require("child_process").spawn;

var {express, app, http, server, io} = require('../src/web.js')
let { logger } = require('./logger.js')
var {newFlightData} = require('./flight-tracker.js');


const FLIGHT_STRUCTURE = {"icao24": null, "callsign": null, "squawk": null, "time_position": null, "time": null, "longitude": null, "latitude": null, "altitude": null, "baro_altitude": null, "geo_altitude": null, "track": null, "velocity": null, "vertical_rate": null, "on_ground": null, "sensors": null, "spi": false, "position_source": null}

class ADSB {
    constructor() {

    }

    get_data() {

    }

    clean_data() {

    }

    start() {

    }

    stop() {

    }

    
}


class OpenSky extends ADSB {
    constructor() {
        super();

        this.service = "open-sky-network"

        this.interval = 20; // Seconds
        this.interval_handler = null;

        this.save_path = String(path.join(__dirname, "..", 'curr-flights.json'));

        this.expected_keys = {"icao24":"icao24", "callsign":"callsign", "time_position":"time_position", "last_contact":"time", "longitude":"longitude", "latitude":"latitude", "baro_altitude":"baro_altitude", "on_ground":"on_ground", "velocity":"velocity", "true_track":"track", "vertical_rate":"vertical_rate", "sensors":"sensors", "geo_altitude":"geo_altitude", "squawk":"squawk", "spi":"spi", "position_source":"position_source"}
    }

    get_data() {
        const child = spawn('python3',["get-data.py", this.save_path]);
        child.addListener('close', (e) => {
            let rawdata = fs.readFileSync(this.save_path);
            let nfd = JSON.parse(rawdata);
            
            nfd = this.clean_data(nfd);
            newFlightData(nfd);
        });
        child.addListener('error', (e) => console.error(e));
    }

    clean_data(nfd) {
        let states = [];

        for(let i=0; i<(nfd.states ?? []).length; i++) {
            states.push(JSON.parse(JSON.stringify(FLIGHT_STRUCTURE)));

            for(let k in this.expected_keys) {
                states[i][this.expected_keys[k]] = nfd.states[i][k] ?? null;
            }

            states[i]["altitude"] = nfd.states[i]["geo_altitude"] ?? (nfd.states[i]["baro_altitude"] ?? null);
            states[i]["track"] = nfd.states[i]["true_track"] ?? null;
        }

        nfd.states = states;

        return nfd
    }

    start() {
        logger.verbose("OpenSky: Start");
        this.get_data.bind(this);
        this.interval_handler = setInterval(this.get_data.bind(this), this.interval * 1000);
    }

    stop() {
        logger.verbose("OpenSky: Stop");
        clearInterval(this.interval_handler);
    }
}


// Simulate flights using real data
class HistoricFlights extends ADSB {
    constructor() {
        super();
        
        this.service = "historic-flights"

        this.active = false;
        this.current_frame = -1;
        this.max_frame = -1;

        this.flightData = {};
        this.data = [];
        this.speed = 1;
        this.interval_handler = null;

        this.expected_keys = {"icao24":"icao24", "callsign":"callsign", "time_position":"time_position", "last_contact":"time", "longitude":"longitude", "latitude":"latitude", "baro_altitude":"baro_altitude", "on_ground":"on_ground", "velocity":"velocity", "true_track":"true_track", "vertical_rate":"vertical_rate", "sensors":"sensors", "geo_altitude":"geo_altitude", "squawk":"squawk", "spi":"spi", "position_source":"position_source"}
    }

    // Load data
    load(file_name) {
        this.active = true;
        fs.readFile(file_name, 'utf8', (err, rawdata) => {
            if (err) {
              logger.error(err);
              return;
            }
    
            this.flightData = JSON.parse(rawdata);

            this.name = this.flightData.name;
            this.start_time = this.flightData["start-time"];
            this.end_time = this.flightData["end-time"];
            this.max_frame = this.flightData["num-flights"];
            this.interval = this.flightData.interval;

            this.data = this.flightData.flights;
    
            logger.info("Using test data: " + this.name)

            this.current_frame = 0;
        });
    }

    get_data() {
        if(this.current_frame >= this.max_frame) {
            logger.verbose("Out of flight data")
            this.stop();
            return 
        }

        let nfd = this.data[Object.keys(this.data)[this.current_frame]];
        nfd = this.clean_data(nfd);

        newFlightData(nfd);
        
        this.emit_metadata();
        this.current_frame += 1;
    }

    clean_data(nfd) {
        let states = [];

        for(let i=0; i<(nfd.states ?? []).length; i++) {
            states.push(JSON.parse(JSON.stringify(FLIGHT_STRUCTURE)));

            for(let k in this.expected_keys) {
                states[i][this.expected_keys[k]] = nfd.states[i][k] ?? null;
            }

            states[i]["altitude"] = nfd.states[i]["geo_altitude"] ?? (nfd.states[i]["baro_altitude"] ?? null);
            states[i]["track"] = nfd.states[i]["true_track"] ?? null;
        }

        nfd.states = states;

        return nfd
    }

    start() {
        if(this.active)
            return

        logger.verbose("HF: Start");
        this.interval_handler = setInterval(this.get_data.bind(this), this.interval * 1000 / this.speed);
        this.active = true;
    }

    stop() {
        if(!this.active)
            return 

        logger.verbose("HF: Stop");
        clearInterval(this.interval_handler);
        this.active = false;
    }

    set_frame(frame) {
        this.stop();
        this.current_frame = frame;
        this.start();
    }

    set_speed(speed) {
        this.stop();
        this.speed = speed;
        this.start();
    }

    get_time() {
        if(this.active)
            return this.data[Object.keys(this.data)[this.current_frame]].time
        else
            return null
    }

    get_metadata() {
        return {"current_frame":this.current_frame, "max_frame":this.max_frame, "speed":this.speed, "interval":this.interval, "name":this.name, "time":this.get_time(), "active":this.active}
    }

    emit_metadata() {
        io.emit('hf_metadata', this.get_metadata());
    }
}

let receiver = null;

module.exports = { receiver, OpenSky, HistoricFlights };

