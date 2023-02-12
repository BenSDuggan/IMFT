// Get ground locations for aircraft

let nodeGeocoder = require('node-geocoder');
const { v4: uuidv4 } = require('uuid');

var {database} = require('./database.js');
let {logger} = require('./logger.js')
let utils = require('./utils.js');


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
            formatted = geo[0].city + ", " + geo[0].state;
          
          location.display_name = formatted;
          location.distance = utils.haversine(flight.latest.latitude, flight.latest.longitude, geo[0].latitude, geo[0].longitude);
  
          return location
        }
      }
  
      return null
    }
}

const location = new Location();


module.exports = { location }
