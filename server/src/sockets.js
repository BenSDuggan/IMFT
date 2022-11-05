/*
 * Handel all of the socket requests
 */

var {express, app, http, server, io} = require('./web.js')
var {database} = require('./database.js')


io.on('connection', (socket) => {
    socket.on('get_hospitals', (msg) => {
        database.get_hospitals().then((hospitals) => {
            socket.emit('hospitals', hospitals);
        });
    });
});



