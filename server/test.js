const fs = require('fs');
const path = require("path");
const spawn = require("child_process").spawn;

let rawdata = fs.readFileSync('curr-flights.json');
let nfd = JSON.parse(rawdata);

console.log(nfd)


