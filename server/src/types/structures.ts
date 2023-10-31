// Data structures

// ADS-B information at a given time point
export interface State {
    "icao24":string, // ADS-B ICAO24
    "callsign":string, // Callsign
    "squawk":number, // Squawk
    "time":number, // Time position was sent
    "last_contact":number,// Time since transponder was last scene
    "lon":number, // Longitude
    "lat":number, // Latitude
    "baro_altitude":number, // Barometric altitude
    "geo_altitude":number, // Altitude
    "heading":number, // Heading, 0 is north
    "velocity":number, // Velocity in MPH
    "vertical_rate":number, // Vertical rate in FPS
    "on_ground":boolean, // On ground or not
    "category":number // Aircraft type
}

// ADS-B information at a given time point but without redundant information
export interface StateShort {
    "time":number, // Time position was sent
    "lon":number, // Longitude
    "lat":number, // Latitude
    "baro_altitude":number, // Barometric altitude
    "geo_altitude":number, // Altitude
    "heading":number, // Heading, 0 is north
    "velocity":number, // Velocity in MPH
    "vertical_rate":number, // Vertical rate in FPS
    "on_ground":boolean, // On ground or not
}

// Stores each of the aircraft. Includes the FAA N-number registry
export interface Aircraft {
    "aid": string, // Unique aircraft ID
    "oid": string, // Organization ID who this belongs to
    "display_name": string, // Clear text name used to display aircraft
    "nn": string, // N-Number
    "icao24": string // icao24 or ""MODE S CODE HEX"
    "faa": { // Data from the FAA N-Number database
        "N-NUMBER":string,
        "SERIAL NUMBER":string,
        "MFR MDL CODE":string,
        "ENG MFR MDL":string,
        "YEAR MFR":string,
        "TYPE REGISTRANT":string,
        "NAME":string,
        "STREET":string,
        "STREET2":string,
        "CITY":string,
        "STATE":string,
        "ZIP CODE":string,
        "REGION":string,
        "COUNTY":string,
        "COUNTRY":string,
        "LAST ACTION DATE":string,
        "CERT ISSUE DATE":string,
        "CERTIFICATION":string,
        "TYPE AIRCRAFT":string,
        "TYPE ENGINE":string,
        "STATUS CODE":string,
        "MODE S CODE":string,
        "FRACT OWNER":string,
        "AIR WORTH DATE":string,
        "OTHER NAMES(1)":string,
        "OTHER NAMES(2)":string,
        "OTHER NAMES(3)":string,
        "OTHER NAMES(4)":string,
        "OTHER NAMES(5)":string,
        "EXPIRATION DATE":string,
        "UNIQUE ID":string,
        "KIT MFR":string,
        "KIT MODEL":string,
        "MODE S CODE HEX":string // icao24
    }
}

// Stores information about current positions of aircraft and their status
export interface Flight {
    "aircraft":Aircraft, // aircraft data
    "last": State, // Data from the last update interval
    "stl": State, // Data from the second to last interval (copied from last when the next update interval occurs)
    "latest": State, // Latest data received, not necessarily up to date
    "time": number, // Time that the last flight data was received
    "tics": number, // How many tics has it been without data
    "tracking": { // Tracking information
        "current": { // The current tracking
            "status": string, // Is the aircraft: `airborn`, `grounded`, or `los`
            "reason": string, // Reason status was changed
            "time": number, // When the flight status was last updated
            "tics": number, // How many intervals the flight status has been the same
            "counter": number, // How many times the flight status has flipped
            "location": string // Location
        },
        "next": { // Tracking next status change
            "status": string, // Is the aircraft: `airborn`, `grounded`, or `los`
            "reason": string, // Reason status was changed
            "time": number, // When the flight status was last updated
            "tics": number, // How many intervals the flight status has been the same
            "counter": number, // How many times the flight status has flipped
            "location": string // Location
        },
        "previous": { // Tracking previous status change
            "status": string, // Is the aircraft: `airborn`, `grounded`, or `los`
            "reason": string, // Reason status was changed
            "time": number, // When the flight status was last updated
            "tics": number, // How many intervals the flight status has been the same
            "counter": number, // How many times the flight status has flipped
            "location": string // Location
        }
    }
}

// Stores information about the trip an aircraft is taking
export interface Trip {
    "tid":string, // Trip ID
    "status":string, // `grounded` `airborn` `los`
    "aircraft": { // Aircraft information
      "aid":string, // Aircraft ID
      "N-NUMBER": string, // Aircraft N-Number
      "display_name": string, // Aircraft name or display name
    },
    "departure": { // Departure information
        "lid": string, // Location ID
        "type": string, // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": string, // Name to display
        "time": number, // Time the status was changed
        "lat": number, // Lat of the location
        "lon": number, // Lon of the location
        "reason": string // Reason status was changed to this
    },
    "arrival": { // Arrival information in 
        "lid": string, // Location ID
        "type": string, // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": string, // Name to display
        "time": number, // Time the status was changed
        "lat": number, // Lat of the location
        "lon": number, // Lon of the location
        "reason": string // Reason status was changed to this
    },
    "stats": {
        "time": number, // Trip travel time in minutes
        "distance": number, // Trip travel distance in miles
    },
    "path":StateShort[ ]// Aircraft travel path
}

export interface Location {
    "lid": string, // Location ID
    "oid": string, // Organization ID
    "display_name": string, // Display name
    "lat": number, // Location latitude
    "lon": number, // Location longitude
    "zone": { // Optional but if included an aircraft will be marked as landed if within this zone
        "radius": number, // Radius of zone from lat/long
        "ceiling": number, // Height limit for zone
    },
    "faa": { // FAA Location data
        "no": string, // Location number
        "type": string, // Airport type
        "name": string, // Airport name
        "state": string, // State
        "county": string, // County
        "lat": number, // Latitude
        "lon": number, // Longitude
        "elevation": number // Elevation
    }
}

// Information about specific organizations including their aircraft and locations
export interface Organization {
    "oid": string, // Organization id
    "display_name": string, // Display name
    "description": string, // Organization description
    "locations": string[], // Locations this organization owns
    "aircraft": string[] // Aircraft his organization owns
}
