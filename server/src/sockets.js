/*
 * Handel all of the socket requests
 */

var {express, app, http, server, io} = require('./web.js')
var {database} = require('./database.js')
var {devFlightData, historic_flights} = require('../test-data/dev-flight-data.js');
var {flights} = require('./flight-tracker.js');


io.on('connection', (socket) => {
    socket.on('get_flights', (msg) => {
        let sendit = []
        for(let f in flights) {
            sendit.push(flights[f])
        }

        socket.emit('nfd', {"flights":sendit});
    });

    socket.on('get_hospitals', (msg) => {
        database.get_hospitals().then((hospitals) => {
            socket.emit('hospitals', hospitals);
        });
    });

    socket.on('get_hf_metadata', (msg) => {
        historic_flights.emit_metadata()
    });

    socket.on('hf_action', (msg) => {
        console.log(msg)
        if(msg.action === "start") {
            historic_flights.start();
        }
        else if(msg.action === "stop") {
            historic_flights.stop();
        }
        else if(msg.action === "speed") {
            historic_flights.set_speed(Number(msg.value));
        }
        else if(msg.action === "frame") {
            historic_flights.set_frame(Number(msg.value));
        }
        else {
            console.error("Received invalid message");
        }

        historic_flights.emit_metadata();
    })
});



