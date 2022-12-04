/*
 * Send flight data that was previously recorded
 */

const fs = require('fs');

var {express, app, http, server, io} = require('../src/web.js')
var {newFlightData} = require('../src/flight-tracker.js');
let {logger} = require('../src/logger.js')

let flightIndex = 0;
let flightData = {};


// Simulate flights using real data
let HistoricFlights = class {
    constructor(flight_processor) {
        this.active = false;
        this.current_frame = -1;
        this.max_frame = -1;

        this.data = [];
        this.flight_processor = flight_processor;
        this.speed = 1;
        this.interval_handler = null;
    }

    // Load data
    load(file_name) {
        this.active = true;
        fs.readFile(file_name, 'utf8', (err, rawdata) => {
            if (err) {
              logger.error(err);
              return;
            }
    
            flightData = JSON.parse(rawdata);

            this.name = flightData.name;
            this.start_time = flightData["start-time"];
            this.end_time = flightData["end-time"];
            this.max_frame = flightData["num-flights"];
            this.interval = flightData.interval;

            this.data = flightData.flights;
    
            logger.info("Using test data: " + this.name)

            this.current_frame = 0;
        });
    }

    start() {
        logger.verbose("HF: Start");
        this.interval_handler = setInterval(() => {
            if(this.current_frame >= this.max_frame) {
                logger.verbose("Out of flight data")
                this.stop();
                return 
            }

            this.flight_processor(this.data[Object.keys(this.data)[this.current_frame]])
            
            this.emit_metadata();
            this.current_frame += 1;
        }, this.interval * 1000 / this.speed);
    }

    stop() {
        logger.verbose("HF: Stop");
        clearInterval(this.interval_handler);
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

const historic_flights = new HistoricFlights(newFlightData)

module.exports = { historic_flights };