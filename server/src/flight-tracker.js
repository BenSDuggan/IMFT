/* Given flight data, do the flight tracking
 * 
 */

const fs = require('fs');
const { request } = require('express');
var {database} = require('./database.js')
var {express, app, http, server, io} = require('./web.js')


let flights = []; // Aircraft getting tracked
let icao24_not_helicopters = [];

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
let newFlightData = async (nfd) => {
  // Prepare flights and make dict
  let dict = {} // Dictionary with ICAO24:index
  for(let i=0; i<flights.length; i++) {
    flights[i].stl = flights[i].last;
    dict[flights[i]["icao24"]] = i;
  }

  // Get new flights whose registration we need to retrieve
  let registration_requests = {};
  let registration_promise = [];
  let registration_results = [];
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;
    if(!(icao24 in dict) && !(icao24 in icao24_not_helicopters)) {
      let request = {"MODE S CODE HEX":icao24.toUpperCase()};
      registration_requests[icao24] = registration_promise.length;
      registration_promise.push(database.get_faa_registration(request))
    }
  }

  // Get registration information
  await Promise.all(registration_promise).then((results) => {
    for(let i=0; i<results.length; i++) {
      delete results["_id"]

      if(results[i] == null) {
        icao24_not_helicopters[Object.keys(registration_requests)[i]] = null;
      }
    }
    registration_results = results;
  })
  
  // Update flight information
  const updateTime = nfd.time;
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;

    // See if aircraft has been tracked recently
    if(!(icao24 in dict)) {
      // Check if aircraft is not a helicopter, skip
      if(registration_results[registration_requests[icao24]] == null) continue

      dict[icao24] = flights.length;
      flights.push({});
      flights[dict[icao24]].faa = registration_results[registration_requests[icao24]];
    }

    flights[dict[icao24]].last = nfd.states[i];
    flights[dict[icao24]].latest = nfd.states[i];
    flights[dict[icao24]].lastUpdated = updateTime;
    flights[dict[icao24]].icao24 = icao24;
  }

  //flights = onGround(flights);
  
  io.emit('nfd', flights);

  console.log("# of flights tracking: " + Object.keys(flights).length)
}


module.exports = { newFlightData };
