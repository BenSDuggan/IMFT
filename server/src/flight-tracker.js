/* Given flight data, do the flight tracking
 * 
 * Data path: Get new data (`newFlightData`) -> update flight position tracking (`newFlightData`) -> update tracking information (`update_tracking`) ->  -> send data
 */

// TODO: Save trips to database
// TODO: Remove from flights and trips after x period of time
// TODO: Create an ability to not track helicopters

let nodeGeocoder = require('node-geocoder');
const { v4: uuidv4 } = require('uuid');

var {database} = require('./database.js');
var {flight_structure, trip_structure, trip_location_structure} = require('./data_structures.js')
const {io} = require('./web.js');
let {logger} = require('./logger.js')
let {twitter} = require('./twitter.js')
let utils = require('./utils.js');

// Constants
const los_time = 5 * 60; // How many seconds before a signal is considered lost
const los_tic = 5; // How many tics before a signal is considered lost
const in_sea_level = 750; // Indiana Sea Level (assume constant since this state is flat)

const whitelist = [];
const blacklist = [];


let tracking_icao24 = { // Which ICAO24 are tracked or untracked
  "tracked_helicopters": new Set(),
  "untracked_helicopters": new Set(),
  "untracked_aircraft": new Set()
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

class Location {
  constructor() {
    this.options = {
      provider: 'openstreetmap',
    };
    this.geoCoder = nodeGeocoder(this.options);
  }

  // Return true if the flight is within zone 1 of a hospital
  flight_within_hospital_zone1 = (flight) => {
    for(let h=0; h<database.hospitals.length; h++) {
      let hospital = database.hospitals[h];

      let dist = utils.haversine(flight.latest.latitude, flight.latest.longitude, hospital.latitude, hospital.longitude);
      if(dist < hospital.zones[0].radius) { // Ceiling not implemented
        return true;
      }
    }

    return false
  }

  // Given a flight, check to see if a flight is at a hospital and return the hospital id or null
  find_nearby_hospitals = (flight) => {
    let results = [];

    for(let h=0; h<database.hospitals.length; h++) {
      let hospital = database.hospitals[h];

      let dist = utils.haversine(flight.latest.latitude, flight.latest.longitude, hospital.latitude, hospital.longitude);

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

  // Given a flight, find the closest airports
  find_nearby_airports = async (flight, max_distance) => {
    let results = [];

    let airports = await database.find_nearby_faa_lid(flight.latest.latitude, flight.latest.longitude, utils.meter_to_feet(max_distance))
    
    for(let a=0; a<airports.length; a++) {
      let airport = airports[a];

      let dist = utils.haversine(flight.latest.latitude, flight.latest.longitude, airport.location.coordinates[1], airport.location.coordinates[0]);

      let location = {
        "id":airport.lid,
        "type":"faaLID",
        "display_name":airport.name, 
        "distance":dist,
        "zone":null
      }

      results.push(location);
    }

    return results.sort((a, b) => {return a.distance - b.distance})
  }

  // Get the closest location to the flight
  // Want: id, display_name, distance, zone, type
  // depth: `soft` = look for locations close to the flight, `hard` = get a geo response if another location can't be determined
  closest_location = async(flight, depth) => {
    if(depth == "hard")
      logger.debug("closest_location: Doing it on hard mode!")

    let hospitals = this.find_nearby_hospitals(flight);

    if(hospitals.length > 0)
      return hospitals[0]

    let airports = null;
    if(depth == 'hard')
      airports = await this.find_nearby_airports(flight, 3000); // KM
    else 
      airports = await this.find_nearby_airports(flight, 1000); // KM

    if(airports.length > 0)
      return airports[0];
    
    if(depth == "hard") {
      // Reverse Geocode
      let location = {
        "id":uuidv4(),
        "type":"geo",
        "display_name": "unknown", 
        "distance":null,
        "zone":null
      }

      let geo = await this.geoCoder.reverse({lat:flight.latest.latitude, lon:flight.latest.longitude})
      .catch((err)=> {
          logger.warn("closest_location: Could not get reverse geocoder information: " + err)
          return null
      }); 

      if(geo != null && geo.length > 0) {
        let formatted = geo[0].formattedAddress;

        if((geo[0].city ?? undefined) != undefined && (geo[0].state ?? undefined) != undefined)
          formatted = results[0].city + ", " + results[0].state;
        
        location.display_name = formatted;
        location.distance = utils.haversine(flight.latest.latitude, flight.latest.longitude, geo[0].latitude, geo[0].longitude);

        return location
      }
    }

    return null
  }
}

class Trips {
  constructor() {
    this.trips = {}
  }

  // Create the arrival or departure information
  create_trip_location(flight) {
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

  async update_trips(flight, old_status, new_status) {
    // Update trip data
    if(this.trips.hasOwnProperty(flight.icao24)) {
      this.trips[flight.icao24].stats.time = flight.time - this.trips[flight.icao24].departure.time;

      let path_length = this.trips[flight.icao24].path.length;
      this.trips[flight.icao24].stats.distance += utils.haversine(flight.latest.latitude, flight.latest.longitude, this.trips[flight.icao24].path[path_length-1][0], this.trips[flight.icao24].path[path_length-1][1]);
      this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);
    }

    if(old_status == new_status) {
      return;
    }

    // takeoff = new trip: grounded -> airborn
    if(old_status == "grounded" && new_status == "airborn") {
      this.trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
      this.trips[flight.icao24].aid = flight.icao24;
      this.trips[flight.icao24].status = new_status;
      this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);

      if(flight.tracking.current.location == null)
        flight.tracking.current.location = await location.closest_location(flight, 'hard');

      this.trips[flight.icao24].departure = this.create_trip_location(flight);
    }
    // landed = trip end: airborn -> grounded
    else if(old_status == "airborn" && new_status == "grounded") {
      this.trips[flight.icao24].status = new_status;

      if(flight.tracking.current.location == null)
        flight.tracking.current.location = await location.closest_location(flight, 'hard');
      this.trips[flight.icao24].arrival = this.create_trip_location(flight);

      // TODO: Save trip to DP and clear from this.trips
    }
    // takeoff or picking up from previous trip or entered airspace from somewhere else = new or continue trip: los -> airborn
    else if(old_status == "los" && new_status == "airborn") {
      // If trip exists -> don't do anything
      // If trip doesn't exist -> make one
      if(!this.trips.hasOwnProperty(flight.icao24)) {
        this.trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
        this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);
        this.trips[flight.icao24].aid = flight.icao24;
        this.trips[flight.icao24].status = new_status;

        if(flight.tracking.current.location == null)
          flight.tracking.current.location = await location.closest_location(flight, 'hard');
        this.trips[flight.icao24].departure = this.create_trip_location(flight);
      }
      else {
        this.trips[flight.icao24].status = new_status;
        this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);
      }
    }
    // lost signal in flight = do what??: airborn -> los
    else if(old_status == "airborn" && new_status == "los") {
      this.trips[flight.icao24].status = new_status;

      if(flight.tracking.current.location == null)
        flight.tracking.current.location = await location.closest_location(flight, 'hard');
      this.trips[flight.icao24].arrival = this.create_trip_location(flight);

      // TODO: Save trip to DP and clear from trips
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
}

class Flights {
  constructor() {
    this.flights = {};
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
    if(!("states" in nfd)) {
      return 
    }

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
      this.flights[icao24].time = nfd.time;
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

      await trips.update_trips(this.flights[f], this.flights[f].tracking.previous.status, this.flights[f].tracking.current.status)

      if(status_changed && status == "grounded")
        flight_landed(this.flights[f])
    }
  }
}

const location = new Location();
const flights = new Flights();
const trips = new Trips();

// Process new flight data
let newFlightData = async (nfd) => {
  await flights.update_flights(nfd);
  await flights.update_tracking(nfd.time);

  let aflights = []
  for(let f in flights.flights) {
    aflights.push(flights.flights[f])
  }
  let atrips = []
  for(let t in trips.trips) {
    atrips.push(trips.trips[t])
  }

  io.emit('nfd', {"flights":aflights, "trips":atrips});

  logger.verbose(new Date(utils.epoch_s()).toISOString() + ": Flights " + Object.keys(flights.flights).length + "; Trips: " + Object.keys(trips.trips).length);
}


module.exports = { newFlightData, flights, trips, location };
