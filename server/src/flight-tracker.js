/* Given flight data, do the flight tracking
 * 
 */

var {express, app, http, server, io} = require('./web.js')


let flights = [];

// Check to see if any aircraft have landed
let onGround = (flights) => {
  
  // Check hospitals
  for(let f in flights) {
    f.airGroundJustChanged = false;
  }

  // Check other locations
  for(let f in flights) {
    f.airGroundJustChanged = false;

    if(f.last && f.last.on_ground) {
      f.airGroundJustChanged = true;
      f.onGround = true;
      console.log("On ground: " + f.last.callsign)
    }
  }

  return flights;
}

// Process new flight data
let newFlightData = (nfd) => {
    // Prepare flights and make dict
    let dict = {}
    for(let i=0; i<flights.length; i++) {
      flights[i].updated = false;
      flights[i].stl = flights[i].last;
  
      dict[flights[i]["icao24"]] = i;
    }
  
    // Update existing flights
    const updateTime = nfd.time;
    for(let i=0; i<nfd.states.length; i++) {
      const icao24 = nfd.states[i].icao24;
  
      if(!(icao24 in dict)) {
        flights.push({});
        dict[icao24] = flights.length - 1;
      }
  
      flights[dict[icao24]].last = nfd.states[i];
      flights[dict[icao24]].latest = nfd.states[i];
      flights[dict[icao24]].lastUpdated = updateTime;
      flights[dict[icao24]].updated = true;
      flights[dict[icao24]].icao24 = icao24;
    }

    flights = onGround(flights);
    
    io.emit('nfd', flights);
  
    console.log("Flights length: " + Object.keys(flights).length)
}


module.exports = { newFlightData };
