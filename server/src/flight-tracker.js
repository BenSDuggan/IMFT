/* Given flight data, do the flight tracking
 * 
 * Data path: Get new data (`newFlightData`) -> update flight position tracking (`newFlightData`) -> update tracking information (`update_tracking`) ->  -> send data
 */

// only marked LOS when all aircraft/last aircraft is LOS
// tracking information is not updating

const { v4: uuidv4 } = require('uuid');

const { epoch_s } = require('./core.js');
var {database} = require('./database.js');
let {logger} = require('./logger.js')
let {twitter} = require('./twitter.js')
const {io} = require('./web.js');

// Constants
const los_time = 3 * 60; // How many seconds before a signal is considered lost
const los_tic = 5; // How many tics before a signal is considered lost
const in_sea_level = 750; // Indiana Sea Level (assume constant since this state is flat)

const whitelist = [];
const blacklist = [];

// Data
let flights = { // Aircraft getting tracked
  
}; 
let tracking_icao24 = { // Which ICAO24 are tracked or untracked
  "tracked_helicopters": new Set(),
  "untracked_helicopters": new Set(),
  "untracked_aircraft": new Set()
}
let trips = {} // Current trips

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
        "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
        "reason": "", // Reason status was changed
        "time": -1, // When the flight status was last updated
        "tics": 0, // How many intervals the flight status has been the same
        "counter": 0, // How many times the flight status has flipped
        "location": null // Location
    },
    "next": { // Tracking next status change
        "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
        "reason": "", // Reason status was changed
        "time": -1, // When the flight status was last updated
        "tics": 0, // How many intervals the flight status has been the same
        "counter": 0, // How many times the next status has flipped
    },
    "previous": { // Tracking next status change
      "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
      "reason": "", // Reason status was changed
      "time": -1, // When the flight status was last updated
      "tics": 0, // How many intervals the flight status has been the same
      "counter": 0, // How many times the next status has flipped
  }
  }
}
const trip_structure = {
  "tid":-1, // Trip ID
  "aid":-1, // Aircraft ID
  "status":"", // `grounded` `airborn` `los`
  "departure": { // Departure information
      "lid": "", // Location ID if one exists
      "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
      "display_name": "", // Name to display
      "time": 0, // Time the status was changed
      "lat": 0, // Lat where location was decided
      "lon": 0, // Lon where location was decided
      "distance": 0, // Distance to true location coordinates when status was changed
      "reason": "" // Reason status was changed to this
  },
  "arrival": { // Arrival information in 
      "lid": "", // Location ID if one exists
      "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
      "display_name": "", // Name to display
      "time": 0, // Time the status was changed
      "lat": 0, // Lat where location was decided
      "lon": 0, // Lon where location was decided
      "distance": 0, // Distance to true location coordinates when status was changed
      "reason": "" // Reason status was changed to this
  },
  "stats": {
      "time": 0, // Trip travel time in minutes
      "distance": 0, // Trip travel distance in miles
  },
  "path": [ // Aircraft travel path

  ]
}
const trip_location_structure = {
  "lid": null, // Location ID if one exists
  "type": "unknown", // Was the location determined using `hospital`, `faaID`, or `geo`
  "display_name": "", // Name to display
  "time": null, // Time the status was changed
  "lat": null, // Lat where location was decided
  "lon": null, // Lon where location was decided
  "distance": null, // Distance to true location coordinates when status was changed
  "reason": null // Reason status was changed to this
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
    return {"status":"los", "reason": flight.tics >= los_tic ? "tics ":" " + time - flight.time > los_time ? "time":""}

  // Check if flight is in the air
  if(flight.latest.vertical_rate > 1 || 
     flight.latest.velocity > 1 || 
     flight.latest.baro_altitude > feet_to_meter(250+in_sea_level)) {
    
      // Within hospital zone 1? Then say grounded
      for(let h in hospital_results) {
        if(hospital_results[h].zone == "zone1")
          return {"status":"grounded", "reason":"Within hospital zone 1"} // Assume on the ground
      }

      return {"status":"airborn", "reason":"Airborn conditions met; not near hospital"} // Assume in the air
  }
  
  return {"status":"grounded", "reason":"Airborn conditions not met"} // Assume on the ground
}

// Given a flight, check to see if a flight is at a hospital and return the hospital id or null
let at_hospital = (flight) => {
  let results = [];

  for(let h=0; h<database.hospitals.length; h++) {
    let hospital = database.hospitals[h];

    let dist = haversine(flight.latest.latitude, flight.latest.longitude, hospital.latitude, hospital.longitude);

    for(let z=0; z<hospital.zones.length; z++) {
      if(dist < hospital.zones[z].radius) { // Ceiling not implemented
        let location = {
          "id":hospital.id,
          "type":"hospital",
          "display_name":hospital.display_name, 
          "distance":dist,
          "zone":hospital.zones[z].id
        }

        results.push(location);
        break
      }
    }
  }

  return results.sort((a, b) => {return a.distance - b.distance})
}

// Get the closest location to the flight
// Want: id, display_name, distance, zone, type
let closest_location = (flights) => {
  return at_hospital(flights);
}

// Process the flight that just landed
let flight_landed = (flight) => {
  if(flight.tracking.current.location == null) {
    return false;
  }

  if(flight.tracking.current.location.hasOwnProperty("hospital") &&
     (flight.tracking.current.location.hospital.tweet ?? false)) {
    let tweet = "N"+flight.faa["N-NUMBER"]+" ("+flight.icao24+"), "+flight.faa["NAME"]+", just landed at "+flight.tracking.current.location.hospital.display_name+
    " ("+flight.latest.latitude+", "+flight.latest.longitude+") " + new Date(epoch_s()*1000).toLocaleString();
    twitter.tweet(tweet);
  }
}

// Create the arrival or departure information
let create_trip_location = (flight) => {
  let trip = JSON.parse(JSON.stringify(trip_location_structure));

  if(flight.tracking.current.location != null) {
    trip.lid = flight.tracking.current.location.id;
    trip.type = flight.tracking.current.location.type;
    trip.display_name = flight.tracking.current.location.display_name;
    trip.distance = flight.tracking.current.location.distance;
    trip.reason = flight.tracking.current.location.reason;
  }

  trip.time = flight.tracking.current.time;
  trip.lat = flight.latest.latitude;
  trip.lon = flight.latest.longitude;

  return trip;
}

// Update the trips
let update_trips = (flight, old_status, new_status) => {
  if(old_status == new_status) {
    logger.warn("Tracker: old and new status are the same. This shouldn't have been passed to the trip.")
    return;
  }

  // takeoff = new trip: grounded -> airborn
  if(old_status == "grounded" && new_status == "airborn") {
    trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
    trips[flight.icao24].status = new_status;
    trips[flight.icao24].departure = create_trip_location(flight);
  }
  // landed = trip end: airborn -> grounded
  else if(old_status == "airborn" && new_status == "grounded") {
    trips[flight.icao24].status = new_status;
    trips[flight.icao24].arrival = create_trip_location(flight);

    // TODO: Save trip to DP and clear from trips
  }
  // takeoff or picking up from previous trip or entered airspace from somewhere else = new or continue trip: los -> airborn
  else if(old_status == "los" && new_status == "airborn") {
    // If trip exists -> don't do anything
    // If trip doesn't exist -> make one
    if(!trips.hasOwnProperty(flight.icao24)) {
      trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
      trips[flight.icao24].status = new_status;
      trips[flight.icao24].departure = create_trip_location(flight);
    }
  }
  // lost signal in flight = do what??: airborn -> los
  else if(old_status == "airborn" && new_status == "los") {
    trips[flight.icao24].status = new_status;
  }
  // visible on ground = do nothing: los -> grounded
  else if(old_status == "los" && new_status == "grounded") {
    
  }
  // los on ground = do nothing: grounded -> los
  else if(old_status == "grounded" && new_status == "los") {
    
  } 
  else {
    logger.warn("Tracker: old status ("+old_status+") or new status ("+new_status+") are not valid.")
  }
}

// Update the tracking information
let update_tracking = (flights, time) => {
  // Determine if aircraft is in the air or on the ground
  for(let f in flights) {
    let status_changed = false;

    // Get closest location
    let location = closest_location(flights[f]);

    // Check strict flight status rules
    let {status, reason} = flight_status(flights[f], time, location);

    // Update tracking information
    if(flights[f].tracking.current.status != status) {
      // Flight status changed
      logger.verbose("Tracker: New status for " + flights[f].icao24 + " (" + flights[f].faa["N-NUMBER"] + ") from " + flights[f].tracking.current.status + " to " + status);
      flights[f].tracking.previous = JSON.parse(JSON.stringify(flights[f].tracking.current));

      flights[f].tracking.current.status = status;
      flights[f].tracking.current.reason = reason;
      flights[f].tracking.current.tics = 1;
      
      status_changed = true;
    }

    // Update common variables
    flights[f].tracking.current.time = time;
    flights[f].tracking.current.tics++;
    if(location.length > 0) {
      flights[f].tracking.current.location = location[0]
    }
    else {
      flights[f].tracking.current.location = null;
    }

    // TODO: New status -> notification / save data
    if(status_changed) {
      update_trips(flights[f], flights[f].tracking.previous.status, flights[f].tracking.current.status)
    }

    if(status_changed && status == "grounded")
      flight_landed(flights[f])
  }

  return flights
}

// Update the flights dict
let update_flights = async(nfd) => {
  if(!("states" in nfd)) {
    return 
  }

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
    if( !(icao24 in flights) && 
        !(tracking_icao24.untracked_aircraft.has(icao24)) && 
        !(tracking_icao24.untracked_helicopters.has(icao24)) && 
        !(tracking_icao24.tracked_helicopters.has(icao24))) {
      let request = {"MODE S CODE HEX":icao24.toUpperCase()};
      registration_requests[icao24] = registration_promise.length;
      registration_promise.push(database.get_faa_registration(request))
    }
  }

  // Get registration information
  await Promise.all(registration_promise).then((results) => {
    for(let i=0; i<results.length; i++) {
      if(results[i] == null) {
        tracking_icao24.untracked_aircraft.add(Object.keys(registration_requests)[i]);
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
      if(registration_results[registration_requests[icao24]] == null) {
        tracking_icao24.untracked_aircraft.add(icao24);
        continue
      }

      tracking_icao24.tracked_helicopters.add(icao24);

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

  let aflights = []
  for(let f in flights) {
    aflights.push(flights[f])
  }
  let atrips = []
  for(let t in trips) {
    atrips.push(trips[t])
  }

  update_tracking(flights, nfd.time);
  io.emit('nfd', {"flights":aflights, "trips":atrips});

  logger.verbose(epoch_s() + ": Flights " + Object.keys(flights).length + "; Trips: " + Object.keys(trips).length);
}




module.exports = { newFlightData, flights };
