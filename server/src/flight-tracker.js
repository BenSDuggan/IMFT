/* Given flight data, do the flight tracking
 * 
 * Data path: Get new data (`newFlightData`) -> update flight position tracking (`newFlightData`) -> update tracking information (`update_tracking`) ->  -> send data
 */

// TODO: Save trips to database
// TODO: Remove from flights and trips after x period of time
// TODO: Create an ability to not track helicopters


const { v4: uuidv4 } = require('uuid');

var {database} = require('./database.js');
const {io} = require('./web.js');
let {location} = require('./location.js')
let {logger} = require('./logger.js')
let {trips} = require('./trips.js')
let {twitter} = require('./twitter.js')
let utils = require('./utils.js');

// Constants
//LIMITATION: retransmitted old data will not cause tics to increment, but time will if `time` or `time_position` is updated
const los_tic = 5; // How many tics before a signal is considered lost. 
const los_time = 5 * 60; // How many seconds before a signal is considered lost
const in_sea_level = 750; // Indiana Sea Level (assume constant since this state is flat)

const whitelist = [];
const blacklist = [];


let tracking_icao24 = { // Which ICAO24 are tracked or untracked
  "tracked_helicopters": new Set(),
  "untracked_helicopters": new Set(),
  "untracked_aircraft": new Set()
}


// Data structures

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
        "location": null // Location
    },
    "previous": { // Tracking next status change
      "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
      "reason": "", // Reason status was changed
      "time": -1, // When the flight status was last updated
      "tics": 0, // How many intervals the flight status has been the same
      "counter": 0, // How many times the next status has flipped
      "location": null // Location
  }
  }
}


// Process the flight that just landed
let flight_landed = (flight) => {
  if(flight.tracking.current.location == null)
    return false;

  if(flight.tracking.current.location.hasOwnProperty("hospital") &&
     (flight.tracking.current.location.hospital.tweet ?? false)) {
    let tweet = "N"+flight.faa["N-NUMBER"]+" ("+flight.icao24+"), "+flight.faa["NAME"]+", just landed at "+flight.tracking.current.location.hospital.display_name+
    " ("+flight.latest.latitude+", "+flight.latest.longitude+") " + new Date(utils.epoch_s()*1000).toLocaleString();
    twitter.tweet(tweet);
  }
}



class Flights {
  constructor() {
    this.flights = {};
    this.nfd = [];
  }

  // Given a flight, check if it's `airborn`, `grounded`, or `los`
  flight_status(flight, time) {
    // Check for LOS
    if(flight.tics >= los_tic || time - flight.time > los_time)
      return {"status":"los", "reason": flight.tics >= los_tic ? "tics ":" " + time - flight.time > los_time ? "time":""}
    
    if(location.flight_within_hospital_zone1(flight))
      return {"status":"grounded", "reason":"Within hospital zone 1"} // Assume on the ground

    // Check if flight is in the air
    if(flight.latest.vertical_rate > 1 || 
      flight.latest.velocity > 1 || 
      flight.latest.baro_altitude > utils.feet_to_meter(250+in_sea_level))
        return {"status":"airborn", "reason":"Airborn conditions met; not near hospital"} // Assume in the air
    
    return {"status":"grounded", "reason":"Airborn conditions not met"} // Assume on the ground
  }

  // Update the flights dict
  async update_flights(nfd) {
    this.nfd = [];

    if(!("states" in nfd)) {
      return 
    }

    // Remove flights that are outside the more specific Indiana bounding box
    for(let i=0; i<nfd.states.length; i++) {
      if(utils.point_within_bounds([nfd.states[i].latitude, nfd.states[i].longitude]))
        this.nfd.push(nfd.states[i]);
    }

    nfd.states = this.nfd;

    // Prepare flights and make dict
    for(let f in this.flights) {
      this.flights[f].stl = this.flights[f].last;
      this.flights[f].tics++;
    }

    // Get new flights whose registration we need to retrieve
    let registration_requests = {};
    let registration_promise = [];
    let registration_results = [];
    for(let i=0; i<nfd.states.length; i++) {
      const icao24 = nfd.states[i].icao24;
      if( !(icao24 in this.flights) && 
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
      if(!(icao24 in this.flights)) {
        // Check if aircraft is not a helicopter, skip
        if(registration_results[registration_requests[icao24]] == null) {
          tracking_icao24.untracked_aircraft.add(icao24);
          continue
        }

        tracking_icao24.tracked_helicopters.add(icao24);

        // Add new flight and make sure it has the right structure
        this.flights[icao24] = JSON.parse(JSON.stringify(flight_structure));
        this.flights[icao24].icao24 = icao24;
        this.flights[icao24].faa = registration_results[registration_requests[icao24]];
      }

      this.flights[icao24].last = nfd.states[i];
      this.flights[icao24].latest = nfd.states[i];
      this.flights[icao24].time = nfd.states[i].time_position ?? (nfd.states[i].time ?? nfd.time);
      this.flights[icao24].tics = 0;
    }
  }

  // Update the tracking information
  async update_tracking (time) {
    // Determine if aircraft is in the air or on the ground
    for(let f in this.flights) {
      let status_changed = false;

      // Check strict flight status rules
      let {status, reason} = this.flight_status(this.flights[f], time);

      // Get closest location
      let loc = await location.closest_location(this.flights[f], 'soft');

      // Update tracking information
      if(this.flights[f].tracking.current.status != status) {
        // Flight status changed
        logger.verbose("Tracker: New status for " + this.flights[f].icao24 + " (" + this.flights[f].faa["N-NUMBER"] + ") from " + this.flights[f].tracking.current.status + " to " + status);
        this.flights[f].tracking.previous = JSON.parse(JSON.stringify(this.flights[f].tracking.current));

        this.flights[f].tracking.current.status = status;
        this.flights[f].tracking.current.reason = reason;
        this.flights[f].tracking.current.tics = 1;
        
        status_changed = true;
      }

      // Update common variables
      this.flights[f].tracking.current.time = time;
      this.flights[f].tracking.current.tics++;
      if(loc != null) {
        this.flights[f].tracking.current.location = loc;
      }
      else {
        this.flights[f].tracking.current.location = null;
      }


      await trips.update_trips(this.flights[f], this.flights[f].tracking.previous.status, this.flights[f].tracking.current.status, status_changed);

      if(status_changed && status == "grounded")
        flight_landed(this.flights[f])
    }
  }
}

const flights = new Flights();

// Process new flight data
let newFlightData = async (nfd) => {

  await flights.update_flights(nfd);
  await flights.update_tracking(nfd.time);

  tracking_garbage_collector(nfd.time);


  // Prepare data to send to clients
  let aflights = []
  for(let f in flights.flights) {
    aflights.push(flights.flights[f])
  }
  let atrips = []
  for(let t in trips.trips) {
    atrips.push(trips.trips[t])
  }

  io.emit('nfd', {"flights":aflights, "trips":atrips});

  logger.verbose(new Date(utils.epoch_s()*1000).toISOString() + ": NFD: "+flights.nfd.length+"; Flights " + Object.keys(flights.flights).length + "; Trips: " + Object.keys(trips.trips).length);
}


// Garbage collector for flights and trips data
// Runs every time new data is retrieved
let tracking_garbage_collector = (time) => {
  let remove_grounded = + time - utils.config.tracking.remove_grounded;
  let remove_los = + time - utils.config.tracking.remove_los;

  let old_flights = flights.flights;
  // Clean flights
  for(f in old_flights) {
    let remove = false;

    if(flights.flights[f].tracking.current.status == "grounded" &&
       flights.flights[f].time < remove_grounded)
        remove = true;

    if(flights.flights[f].tracking.current.status == "los" &&
       flights.flights[f].time < remove_los) 
        remove = true;

    if(remove) {
      let remove_trips = Object.keys(trips.trips).filter(t => trips.trips[t].aircraft.aid == flights.flights[f].icao24);
      remove_trips.map(t => delete trips.trips[t])

      delete flights.flights[f];
    }
  }
}

// Clean data every interval (using remove_grounded or remove_los, whichever is smaller)
// Only in production mode since we need to specify a time
if(process.env.IMFT_ENV == "production") {
  setInterval(() => tracking_garbage_collector(utils.epoch_s()),
                    utils.config.tracking.remove_grounded > utils.config.tracking.remove_los ? 
                    utils.config.tracking.remove_los : utils.config.tracking.remove_grounded)
}


module.exports = { newFlightData, flights };
