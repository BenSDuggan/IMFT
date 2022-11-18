/* Given flight data, do the flight tracking
 * 
 */

var {database} = require('./database.js')
var {express, app, http, server, io} = require('./web.js')

// Constants
const los_time = 5; // How many minutes before a signal is considered lost
const hospital_radius = 1000; // How many feet a flight has to be to be "arrived"
const hospital_ceiling = 500; // How many feet a flight has to be to be "arrived"

let flights = {}; // Aircraft getting tracked
let icao24_not_helicopters = {};
let count = 1;

const flight_structure = {
  "faa":{},
  "last":{},
  "latest":{},
  "lastUpdated":-1,
  "icao24":-1,
  "tracking":{
    "flight_status":null,
    "flight_status_updated_time":null,
    "flight_status_counter":0,
    "flight_status_change_counter":0
  }
}


let meter_to_feet = (meter) => meter * 3.28084;
let feet_to_meter = (feet) => feet * 0.3048;
let deg2rad = (deg) => deg * Math.PI/180
let haversine = (lat1, lon1, lat2, lon2) => {
  let a = Math.sin(deg2rad(lat2-lat1)/2)**2+
          Math.cos(deg2rad(lat2))*
          Math.cos(deg2rad(lat1))*
          Math.sin(deg2rad(lon2-lon1)/2)**2
  
  return 2 * meter_to_feet(6371e3) * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
// Measure the distance between 2 points. Should be ~100yrds=300ft
//console.log(haversine(39.18048154123995, -86.52535587827155, 39.18130600162018, -86.5253532904204))

// Steps
// new flight data -> update flight list -> update tracking (Get status -> at hospital -> is this new?)



// Given a flight, check if it's `airborn`, `grounded`, or `los`
let flight_status = (flight) => {
  // Check for LOS
  //if(Math.round(new Date().getTime() / 1000) - flight.lastUpdated > los_time) return "los"

  // Check if flight is in the air
  if(flight.latest.vertical_rate > 1 || 
     flight.latest.velocity > 1 || 
     flight.latest.baro_altitude > feet_to_meter(250+700))
      return "airborn" // Assume in the air
  
  return "grounded" // Assume on the ground
}

// Given a flight, check to see if a flight is at a hospital and return the hospital id or null
let at_hospital = (flight) => {
  for(let h=0; h<database.hospitals.length; h++) {
      //if(flight.latest.baro_altitude+700 < database.hospitals[h].zones[z].ceiling) 
      let dist = haversine(flight.latest.latitude, flight.latest.longitude, database.hospitals[h].latitude, database.hospitals[h].longitude);
      if(dist < hospital_radius) {

      }
  }
}

// Update the tracking information
let update_tracking = (flights) => {
  let t = Math.round(new Date().getTime() / 1000);

  // Determine if aircraft is in the air or on the ground
  for(let i=0; i<flights.length; i++) {
    let new_status = flight_status(flights[i]);
    at_hospital(flights[i])

    if(flights[i].tracking["flight_status"] != new_status) {
      // Flight status has changed
      flights[i].tracking["flight_status_change_counter"]++
      flights[i].tracking["flight_status_counter"] = 0;
    }
    else {
      // Flight status is the same
      flights[i].tracking["flight_status_counter"]++
    }

    flights[i].tracking["flight_status"] = new_status;
    flights[i].tracking["flight_status_updated_time"] = t;
  }

  return flights
}

// Update the flights dict
let update_flights = async(nfd) => {
  // Prepare flights and make dict
  for(let f in flights) {
    flights[f].stl = flights[f].last;
  }

  // Get new flights whose registration we need to retrieve
  let registration_requests = {};
  let registration_promise = [];
  let registration_results = [];
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;
    if(!(icao24 in flights) && !(icao24 in icao24_not_helicopters)) {
      let request = {"MODE S CODE HEX":icao24.toUpperCase()};
      registration_requests[icao24] = registration_promise.length;
      registration_promise.push(database.get_faa_registration(request))
    }
  }

  // Get registration information
  await Promise.all(registration_promise).then((results) => {
    for(let i=0; i<results.length; i++) {
      if(results[i] == null) {
        icao24_not_helicopters[Object.keys(registration_requests)[i]] = null;
      }
      else {
        delete results[i]["_id"]
      }
    }
    registration_results = results;
  })
  
  // Update flight information
  const updateTime = nfd.time;
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;

    // See if aircraft has been tracked recently
    if(!(icao24 in flights)) {
      // Check if aircraft is not a helicopter, skip
      if(registration_results[registration_requests[icao24]] == null) continue

      // Add new flight and make sure it has the right structure
      flights[icao24] = {...flight_structure};
      flights[icao24].faa = registration_results[registration_requests[icao24]];
    }

    flights[icao24].last = nfd.states[i];
    flights[icao24].latest = nfd.states[i];
    flights[icao24].lastUpdated = updateTime;
    flights[icao24].icao24 = icao24;
  }
}


// Process new flight data
let newFlightData = async (nfd) => {
  await update_flights(nfd);

  let sendit = []
  for(let f in flights) {
    sendit.push(flights[f])
  }

  let metadata = {"time":nfd.time, "count":count++}
  io.emit('nfd', {"flights":sendit, "metadata": metadata});

  //update_tracking(flights);

  console.log("# of flights tracking: " + Object.keys(flights).length)
}




module.exports = { newFlightData };
