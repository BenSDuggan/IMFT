/*
 * Handel all of the socket requests
 */

var {express, app, http, server, io} = require('./web.js')
var {database} = require('./database.js')
var {devFlightData, historic_flights} = require('./test-data/dev-flight-data.js');


io.on('connection', (socket) => {
    socket.on('get_hospitals', (msg) => {
        database.get_hospitals().then((hospitals) => {
            socket.emit('hospitals', hospitals);
        });
    });

    socket.on('hf_action', (msg) => {
        console.log(msg)
        if(msg === "start") {
            historic_flights.start();
        }
        else if(msg === "stop") {
            historic_flights.stop();
        }
        else {
            console.error("Received invalid message");
        }

        historic_flights.emit_metadata();
    })
});



