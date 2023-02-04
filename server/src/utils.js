// Core functions and classes needed by every other class
// Includes config, helper, and locations functions

const fs = require('fs')
const os = require('os');

config_path = os.homedir() + "/.config/imft/config.json"


/****************************
 ***   Helper Functions   ***
 ***************************/

// Get the current time from epoch in seconds
const epoch_s = () => Math.floor(Date.now()/1000)

let meter_to_feet = (meter) => meter * 3.28084;
let feet_to_meter = (feet) => feet * 0.3048;
let feet_to_mile = (feet) => feet / 5280;
let deg2rad = (deg) => deg * Math.PI/180
let haversine = (lat1, lon1, lat2, lon2) => {
  let a = Math.sin(deg2rad(lat2-lat1)/2)**2+
          Math.cos(deg2rad(lat2))*
          Math.cos(deg2rad(lat1))*
          Math.sin(deg2rad(lon2-lon1)/2)**2
  
  return 2 * meter_to_feet(6371e3) * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) // Distance in feet
}
// Measure the distance between 2 points. Should be ~100yrds=300ft
//console.log(haversine(39.18048154123995, -86.52535587827155, 39.18130600162018, -86.5253532904204))


/******************
 ***   Config   ***
 *****************/

config = {};

let load_config = () => {
    if (fs.existsSync(config_path) || true) {
        let rawdata = fs.readFileSync(config_path);
        config = JSON.parse(rawdata);
    }
}

let save_config = () => {
    let data = JSON.stringify(config);
    fs.writeFileSync(config_path, data);
}

load_config();


module.exports = { 
    epoch_s, 
    meter_to_feet,
    feet_to_meter,
    feet_to_mile,
    deg2rad,
    haversine,
    config, 
    load_config,
    save_config
};