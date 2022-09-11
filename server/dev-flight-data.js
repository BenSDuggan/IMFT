/*
 * Send flight data that was previously recorded
 */

const fs = require('fs');

let flightIndex = 0;
let flightData = {};

let devFlightData = (file, dataProcessor) => {
    // Read data
    fs.readFile(file, 'utf8', (err, rawdata) => {
        if (err) {
          console.error(err);
          return;
        }

        flightData = JSON.parse(rawdata);

        console.log("Using test data: " + flightData["name"])

        // Schedule data sending
        setInterval(() => {
            if(flightIndex >= flightData["interval"]) {
                console.log("No more data")
                return;
            }

            dataProcessor(flightData["flights"][Object.keys(flightData["flights"])[flightIndex++]]);
        }, flightData["interval"] * 1000)
    });
}

module.exports = { devFlightData };