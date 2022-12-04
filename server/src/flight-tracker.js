/* Given flight data, do the flight tracking
 * 
 * Data path: Get new data (`newFlightData`) -> update flight position tracking (`newFlightData`) -> update tracking information (`update_tracking`) ->  -> send data
 */

// only marked LOS when all aircraft/last aircraft is LOS
// tracking information is not updating

var {database} = require('./database.js');
let {logger} = require('./logger.js')
var {express, app, http, server, io} = require('./web.js')

// Constants
const los_time = 2 * 60; // How many seconds before a signal is considered lost
const los_tic = 5; // How many tics before a signal is considered lost
const in_sea_level = 750; // Indiana Sea Level (assume constant since this state is flat)

let flights = {}; // Aircraft getting tracked
let icao24_not_helicopters = {};
let count = 1;

const flight_structure = {
  "icao24": "", // The icao24
  "faa":{}, // FAA registration data
  "last":{}, // Data from the last update interval
  "stl":{}, // Data from the second to last interval (copied from last when the next update interval occurs)
  "latest":{}, // Latest data received, not necessarily up to date
  "time": -1, // Time that the last flight data was received
  "tics": 0, // How many tics has it been without data
  "tracking": { // Tracking information
    "current": { // The current tracking
        "status": "", // Is the aircraft: `airborn`, `grounded`, or `los`
        "time": -1, // When the flight status was last updated
        "tics": 0, // How many intervals the flight status has been the same
        "counter": 0, // How many times the flight status has flipped
        "location": null // Location
    },
    "next": { // Tracking next status change
        "status": "", // Is the aircraft: `airborn`, `grounded`, or `los`
        "time": -1, // When the flight status was last updated
        "tics": 0, // How many intervals the flight status has been the same
        "counter": 0, // How many times the next status has flipped
    }
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


// Given a flight, check if it's `airborn`, `grounded`, or `los`
let flight_status = (flight, time, hospital_results) => {
  // Check for LOS
  if(flight.tics >= los_tic || time - flight.time > los_time)
    return "los"

  // Check if flight is in the air
  if(flight.latest.vertical_rate > 1 || 
     flight.latest.velocity > 1 || 
     flight.latest.baro_altitude > feet_to_meter(250+in_sea_level)) {
    
      // Within hospital zone 1? Then say grounded
      for(let h in hospital_results) {
        if(hospital_results[h].zone == "zone1")
          return "grounded" // Assume on the ground
      }

      return "airborn" // Assume in the air
  }
  
  return "grounded" // Assume on the ground
}

// Given a flight, check to see if a flight is at a hospital and return the hospital id or null
let at_hospital = (flight) => {
  let results = [];

  for(let h=0; h<database.hospitals.length; h++) {
    let hospital = database.hospitals[h];

    let dist = haversine(flight.latest.latitude, flight.latest.longitude, hospital.latitude, hospital.longitude);

    for(let z=0; z<hospital.zones.length; z++) {
      if(dist < hospital.zones[z].radius) { // Ceiling not implemented
        results.push({"id":hospital.id, "zone":hospital.zones[z].id, "distance":dist, "hospital":hospital});
        break
      }
    }
  }

  return results.sort((a, b) => {return a.distance - b.distance})
}

// Process the flight that just landed
let flight_landed = (flight) => {
  let tweet = "N"+flight.faa["N-NUMBER"]+"("+flight.icao24+", "+flight.faa["NAME"]+", just landed at "+flight.tracking.current.location.hospital.display_name;
  logger.info("Would tweet: " + tweet)
}

// Update the tracking information
let update_tracking = (flights, time) => {
  // Determine if aircraft is in the air or on the ground
  for(let f in flights) {
    console.log("2: " + f);

    // Check if flight is at a hospital
    let hospital_results = at_hospital(flights[f]);
    console.log(hospital_results)

    // Check strict flight status rules
    let new_status = flight_status(flights[f], time, hospital_results)

    console.log(new_status);

    // Update tracking information
    if(flights[f].tracking.current.status == new_status) {
      flights[f].tracking.current.tics++;
    }
    else {
      // Flight status changed
      flights[f].tracking.current.status = new_status;
      flights[f].tracking.current.tics = 1;
      flights[f].tracking.current.counter++;
      
      // TODO: New status -> notification / save data
      if(new_status == "grounded")
        flight_landed(flights[f])
    }

    // Update common variables
    flights[f].tracking.current.time = time;
    if(hospital_results.length > 0) {
      flights[f].tracking.current.location = hospital_results[0]
    }
    else {
      flights[f].tracking.current.location = null;
    }
  }

  return flights
}

// Update the flights dict
let update_flights = async(nfd) => {
  // Prepare flights and make dict
  for(let f in flights) {
    flights[f].stl = flights[f].last;
    flights[f].tics++;
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
  for(let i=0; i<nfd.states.length; i++) {
    const icao24 = nfd.states[i].icao24;

    // See if aircraft has been tracked recently
    if(!(icao24 in flights)) {
      // Check if aircraft is not a helicopter, skip
      if(registration_results[registration_requests[icao24]] == null) continue

      // Add new flight and make sure it has the right structure
      flights[icao24] = JSON.parse(JSON.stringify(flight_structure));
      flights[icao24].icao24 = icao24;
      flights[icao24].faa = registration_results[registration_requests[icao24]];
    }

    flights[icao24].last = nfd.states[i];
    flights[icao24].latest = nfd.states[i];
    flights[icao24].time = nfd.time;
    flights[icao24].tics = 0;
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
  update_tracking(flights, nfd.time);
  io.emit('nfd', {"flights":sendit});

  console.log("# of flights tracking: " + Object.keys(flights).length)
}




module.exports = { newFlightData };
