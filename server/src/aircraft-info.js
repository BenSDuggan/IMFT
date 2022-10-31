/*
 * Get the aircraft data
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const aircraftFile = '../database/aircraft/MASTER.txt'
const helicopterFile = 'database/helicopter-faa.json'

let helicopters = {};

// Open helicopters in FAA registration
let openFAAHelicopter = () => {
  fs.readFile(helicopterFile, 'utf8', (err, rawdata) => {
    if (err) {
      console.error(err);
      return;
    }
    
    helicopters = JSON.parse(rawdata);
  });
}

setInterval(function(){
  console.log(Object.keys(helicopters).length)
}, 500);

// Save helicopters in FAA registration
let saveFAAHelicopter = () => {
  // Read data
  fs.createReadStream(aircraftFile)
    .pipe(parse({ 
      delimiter: ",", 
      columns: true,
      ltrim: true, 
      trim:true,
      relax_quotes: true,
      }))
    .on("data", function (row) {
      if(row["TYPE AIRCRAFT"] == '6') {
        r = {}
        for(k in Object.keys(row)) {
          key = Object.keys(row)[k]
          l = key.replace(/[\u{0080}-\u{FFFF}]/gu, "");
          r[l] = row[key];
        }

        helicopters[row["MODE S CODE HEX"]] = r;
      }
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {
      console.log("Saved FAA Helicopters")
      fs.writeFileSync(helicopterFile, JSON.stringify(helicopters));
    });
}

// Get FAA data
let faa = () => {
  return helicopters;
}

openFAAHelicopter()
//saveFAAHelicopter()

module.exports = { faa:faa };