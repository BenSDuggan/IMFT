// Manage active and previous trips

const { v4: uuidv4 } = require('uuid');

var {database} = require('./database.js');
let {logger} = require('./logger.js')
let {location} = require('./location')
let utils = require('./utils.js');


// Data structures
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
    "type": "unknown", // Was the location determined using `hospital`, `faaLID`, or `geo`
    "display_name": "", // Name to display
    "time": null, // Time the status was changed
    "lat": null, // Lat where location was decided
    "lon": null, // Lon where location was decided
    "distance": null, // Distance to true location coordinates when status was changed
    "reason": null // Reason status was changed to this
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

  async update_trips(flight, old_status, new_status, status_changed) {
    // Update trip data
    if(this.trips.hasOwnProperty(flight.icao24)) {
      this.trips[flight.icao24].stats.time = flight.time - this.trips[flight.icao24].departure.time;

      let path_length = this.trips[flight.icao24].path.length;
      this.trips[flight.icao24].stats.distance += utils.feet_to_mile(utils.haversine(flight.latest.latitude, flight.latest.longitude, this.trips[flight.icao24].path[path_length-1][0], this.trips[flight.icao24].path[path_length-1][1]));
      this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);
    }

    if(old_status == new_status || !status_changed) {
      return;
    }

    // takeoff = new trip: grounded -> airborn
    if(old_status == "grounded" && new_status == "airborn") {
      this.trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
      this.trips[flight.icao24].tid = uuidv4();
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
      this.database_add_trip(this.trips[flight.icao24])
      .catch((error) => {
        logger.warn("Tracker: Could not save trip (" + this.trips[flight.icao24].tid + "). " + error)
      })
    }
    // takeoff or picking up from previous trip or entered airspace from somewhere else = new or continue trip: los -> airborn
    else if(old_status == "los" && new_status == "airborn") {
      // If trip exists -> don't do anything
      // If trip doesn't exist -> make one
      if(!this.trips.hasOwnProperty(flight.icao24)) {
        this.trips[flight.icao24] = JSON.parse(JSON.stringify(trip_structure));
        this.trips[flight.icao24].tid = uuidv4();
        this.trips[flight.icao24].aid = flight.icao24;
        this.trips[flight.icao24].status = new_status;
        this.trips[flight.icao24].path.push([flight.latest.latitude, flight.latest.longitude]);

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
      this.database_add_trip(this.trips[flight.icao24])
      .catch((error) => {
        logger.warn("Tracker: Could not save trip (" + this.trips[flight.icao24].tid + "). " + error)
      })
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

  async database_add_trip(trip) {
    if(process.env.IMFT_ENV !== "production") 
      return false;

      // Prepare trip for DB: unix date -> Date()
      trip.arrival.time = new Date(trip.arrival.time * 1000);
      trip.departure.time = new Date(trip.departure.time * 1000);
      trip.stats.distance = Number(trip.stats.distance.toFixed(2))

      // Add trip to DB
      await database.save_trip(trip)
      .then((result) => {
          return result
      })
      .catch((error) => {
          logger.warn("Tracker: Could not save trip (" + this.trips[flight.icao24].tid + "). " + error)
          return false
      })
  }

    
    // Access Database

    // Get trips. Options include tid, aid, lid, departure_lid, arrival_lid, min_date, max_date
    async database_get_trip(options) {
      let term = {};
      let first_term = true;

      // Filter by date
      if(options.hasOwnProperty("min_date") && options.hasOwnProperty("max_date")) {
        let min_date = new Date(options.min_date);
        let max_date = new Date(options.max_date);

        term = {$and:[{$or:[{$and:[{"departure.time": {$gte:min_date}}, {"departure.time":{$lte:max_date}}]}, 
                        {$and:[{"arrival.time": {$gte:min_date}}, {"arrival.time":{$lte:max_date}}]}]}]};
        first_term = false;
      }

      // Filter by tid
      if(options.hasOwnProperty("tid")) {
        if(first_term) {
          term = {$and:[{"tid": String(options.tid)}]}
          first_term = false;
        }
        else 
          term[$and].push({"tid": String(options.tid)});
      }

      // Filter by aid
      if(options.hasOwnProperty("aid")) {
        if(first_term) {
          term = {$and:[{"aid": String(options.aid)}]}
          first_term = false;
        }
        else 
          term[$and].push({"aid": String(options.aid)});
      }

      // Filter by departure_lid
      if(options.hasOwnProperty("departure_lid")) {
        if(first_term) {
          term = {$and:[{"departure.lid": String(options.departure_lid)}]}
          first_term = false;
        }
        else 
          term[$and].push({"departure.lid": String(options.departure_lid)});
      }

      // Filter by destination_lid
      if(options.hasOwnProperty("arrival_lid")) {
        if(first_term) {
          term = {$and:[{"arrival.lid": String(options.arrival_lid)}]}
          first_term = false;
        }
        else 
          term[$and].push({"arrival.lid": String(options.arrival_lid)});
      }

      // Filter by lid
      if(options.hasOwnProperty("lid")) {
        if(first_term) {
          term = {$and:[{$or:[{"departure.lid": String(options.lid)}, {"arrival.lid": String(options.lid)}]}]}
          first_term = false;
        }
        else 
          term[$and].push({$or:[{"departure.lid": String(options.lid)}, {"arrival.lid": String(options.lid)}]});
      }

      return await database.get_trip(term)
    }

    // Get aircraft (aid) indexes for the min_date (departure) and max_date (arrival)
    async database_get_aid_index(min_date, max_date) {
        min_date = new Date(min_date);
        max_date = new Date(max_date);

        let term = {$or:[{$and:[{"departure.time": {$gte:min_date}}, {"departure.time":{$lte:max_date}}]}, 
                        {$and:[{"arrival.time": {$gte:min_date}}, {"arrival.time":{$lte:max_date}}]}]}

        return await database.get_trip_index("aid", term)
    }
}

const trips = new Trips();

module.exports = {
    trips
}

