const fs = require('fs');
const path = require("path");
const spawn = require("child_process").spawn;

const child = spawn('python',["src/get-data.py", "/Users/ben/github/flight-alert/server/curr-flights.json"]);
child.addListener('close', (e) => {
    let rawdata = fs.readFileSync("/Users/ben/github/flight-alert/server/curr-flights.json");
    let nfd = JSON.parse(rawdata);
});
child.addListener('error', (e) => console.error(e));
child.stdout.on('data', (data) => { console.log(data) });