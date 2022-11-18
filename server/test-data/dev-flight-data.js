/*
 * Send flight data that was previously recorded
 */

const fs = require('fs');

var {express, app, http, server, io} = require('../src/web.js')
var {newFlightData} = require('../src/flight-tracker.js');

let flightIndex = 0;
let flightData = {};

let devFlightData = (file, dataProcessor, speed_multiplier) => {
    // Read data
    fs.readFile(file, 'utf8', (err, rawdata) => {
        if (err) {
          console.error(err);
          return;
        }
        flightIndex = 150;

        flightData = JSON.parse(rawdata);

        console.log("Using test data: " + flightData["name"])

        dataProcessor(flightData["flights"][Object.keys(flightData["flights"])[flightIndex++]]);

        // Schedule data sending
        setInterval(() => {
            if(flightIndex >= flightData["num-flights"]) {
                console.log("No more data")
                return;
            }

            dataProcessor(flightData["flights"][Object.keys(flightData["flights"])[flightIndex++]]);
        }, flightData["interval"] * 1000 / speed_multiplier)
    });
}

// Simulate flights using real data
let HistoricFlights = class {
    constructor(flight_processor) {
        this.current_frame = -1;
        this.max_frame = -1;

        this.data = [];
        this.flight_processor = flight_processor;
        this.speed = 1;
        this.interval_handler = null;
    }

    // Load data
    load(file_name) {
        fs.readFile(file_name, 'utf8', (err, rawdata) => {
            if (err) {
              console.error(err);
              return;
            }
    
            flightData = JSON.parse(rawdata);

            this.name = flightData.name;
            this.start_time = flightData["start-time"];
            this.end_time = flightData["end-time"];
            this.max_frame = flightData["num-flights"];
            this.interval = flightData.interval;

            this.data = flightData.flights;
    
            console.log("Using test data: " + this.name)

            this.current_frame = 0;
        });
    }

    start() {
        this.interval_handler = setInterval(() => {
            console.log(this.current_frame)
            this.flight_processor(this.data[Object.keys(this.data)[this.current_frame++]])
            io.emit('hf_metadata', this.get_metadata());
        }, this.interval * 1000 / this.speed);
    }

    stop() {
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
        return this.data[Object.keys(this.data)[this.current_frame]].time
    }

    get_metadata() {
        return {"current_frame":this.current_frame, "max_frame":this.max_frame, "speed":this.speed, "interval":this.interval, "name":this.name, "time":this.get_time()}
    }
}

const historic_flights = new HistoricFlights(newFlightData)

module.exports = { devFlightData, historic_flights };