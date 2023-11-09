# New Structure starting in September 2023

## Data structures

* `locations`: Common locations where aircraft land. Includes data from the FAA LID airport registry and additional data manually entered. Unique scene 
* `organization`: Information about specific organizations including their aircraft and locations
* `flights`: Stores information about current positions of aircraft and their status
* `trips`: Stores information about the trip an aircraft is taking
* `State`: ADS-B information at a given time point
* `StateShort`: ADS-B information at a given time point but without redundant information

### Locations

```
{
    "lid": string, // Location ID
    "oid": string, // Organization ID
    "display_name": string, // Display name
    "city": string, // City the location is in
    "state": string, // State the location is in
    "type":string, // Location type (hospital, airport, lz)
    "lat": number, // Location latitude
    "lon": number, // Location longitude
    "elevation": number, // Elevation
    "zone": null | { // Optional but if included an aircraft will be marked as landed if within this zone
        "radius": number, // Radius of zone from lat/long
        "ceiling": number, // Height limit for zone
    },
    "faa": null | { // FAA Location data if available
        "no": string, // Location number
        "type": string, // Airport type
        "name": string, // Airport name
    }
}
```

### Organization

```
{
    "oid": string, // Organization id
    "display_name": string, // Display name
    "description": string, // Organization description
    "locations": string[], // LID of locations this organization owns
    "aircraft": string[] // AID of aircraft his organization owns
}
```

### Flights

Used by server and client to store the locations of aircraft.

```
{
    "aircraft":{}, // aircraft data
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
            "counter": 0, // How many times the flight status has flipped
            "location": null // Location
        },
        "previous": { // Tracking previous status change
            "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
            "reason": "", // Reason status was changed
            "time": -1, // When the flight status was last updated
            "tics": 0, // How many intervals the flight status has been the same
            "counter": 0, // How many times the flight status has flipped
            "location": null // Location
        }
    }
}
```

### Trips

This data structure matches the `trips` data structure which goes in the database. Data structure for a trip which captures the path traveled from the beginning to the end of a flights path.

```
{
    "tid":-1, // Trip ID
    "status":"", // `grounded` `airborn` `los`
    "aircraft": { // Aircraft information
      "aid":-1, // Aircraft ID
      "N-NUMBER": null, // Aircraft N-Number
      "display_name": "", // Aircraft name or display name
    },
    "departure": { // Departure information
        "lid": "", // Location ID
        "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": "", // Name to display
        "time": 0, // Time the status was changed
        "lat": 0, // Lat of the location
        "lon": 0, // Lon of the location
        "reason": "" // Reason status was changed to this
    },
    "arrival": { // Arrival information in 
        "lid": "", // Location ID
        "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": "", // Name to display
        "time": 0, // Time the status was changed
        "lat": 0, // Lat of the location
        "lon": 0, // Lon of the location
        "reason": "" // Reason status was changed to this
    },
    "stats": {
        "time": 0, // Trip travel time in minutes
        "distance": 0, // Trip travel distance in miles
    },
    "path": [ // Aircraft travel path

    ]
}
```

### State

Represents one point in the aircrafts trace.

```
{
    "icao24":"", // ADS-B ICAO24
    "callsign":"", // Callsign
    "squawk":"", // Squawk
    "time":"", // Time position was sent
    "last_contact":"",// Time since transponder was last scene
    "lon":"", // Longitude
    "lat":"", // Latitude
    "baro_altitude":"", // Barometric altitude
    "geo_altitude":"", // Altitude
    "heading":"", // Heading, 0 is north
    "velocity":"", // Velocity in MPH
    "vertical_rate":"", // Vertical rate in FPS
    "on_ground":"", // On ground or not
    "category":"" // Aircraft type
}
```

### StateShort

Represents one point in the aircrafts trace.

```
{
    "time":"", // Time position was sent
    "lon":"", // Longitude
    "lat":"", // Latitude
    "baro_altitude":"", // Barometric altitude
    "geo_altitude":"", // Altitude
    "heading":"", // Heading, 0 is north
    "velocity":"", // Velocity in MPH
    "vertical_rate":"", // Vertical rate in FPS
    "on_ground":"", // On ground or not
}
```

## Server

The two main data structures are `flight` and `trip`. Flights are updated with the current ADS-B data and is how the progress of an aircraft is tracked. Trips track the actual begin to end of travel and are meant to be stored in a database.

### API

* Organization
    * `/api/organizations` (GET): Get all of the organizations
    * `/api/organizations/{:oid}` (GET): Get the specified organization by `oid`
    * `/api/organizations/{:oid}` (DELETE): Removed the specified organization by `oid`
* Miscellaneous 
    * `/api/version` (GET): Gets the current server version 

## Database

MongoDB

### Collections

* `trips`: Stores each of the trips
* `aircraft`: Stores each of the aircraft. Includes the FAA N-number registry
* `organization`: Information about specific organizations including their aircraft and locations

#### trips

Stores all of the individual trips.

```
{
    "tid":-1, // Trip ID
    "status":"", // `grounded` `airborn` `los`
    "aircraft": { // Aircraft information
      "aid":-1, // Aircraft ID
      "N-NUMBER": null, // Aircraft N-Number
      "display_name": "", // Aircraft name or display name
    },
    "departure": { // Departure information
        "lid": "", // Location ID
        "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": "", // Name to display
        "time": 0, // Time the status was changed
        "lat": 0, // Lat of the location
        "lon": 0, // Lon of the location
        "reason": "" // Reason status was changed to this
    },
    "arrival": { // Arrival information in 
        "lid": "", // Location ID
        "type": "", // Was the location determined using `hospital`, `faaID`, or `geo`
        "display_name": "", // Name to display
        "time": 0, // Time the status was changed
        "lat": 0, // Lat of the location
        "lon": 0, // Lon of the location
        "reason": "" // Reason status was changed to this
    },
    "stats": {
        "time": 0, // Trip travel time in minutes
        "distance": 0, // Trip travel distance in miles
    },
    "path": [ // Aircraft travel path

    ]
}
```



#### aircraft

FAA aircraft registration, but only rotor craft. Taken from <https://registry.faa.gov/database/ReleasableAircraft.zip> and <https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/releasable_aircraft_download>.

```
{
    "aid": "", // Unique aircraft ID
    "oid": "", // Organization ID who this belongs to
    "display_name": "", // Clear text name used to display aircraft
    "nn": "", // N-Number
    "icao24": "" // icao24 or ""MODE S CODE HEX"
    "faa": { // Data from the FAA N-Number database
        "N-NUMBER":"",
        "SERIAL NUMBER":"",
        "MFR MDL CODE":"",
        "ENG MFR MDL":"",
        "YEAR MFR":"",
        "TYPE REGISTRANT":"",
        "NAME":"",
        "STREET":"",
        "STREET2":"",
        "CITY":"",
        "STATE":"",
        "ZIP CODE":"",
        "REGION":"",
        "COUNTY":"",
        "COUNTRY":"",
        "LAST ACTION DATE":"",
        "CERT ISSUE DATE":"",
        "CERTIFICATION":"",
        "TYPE AIRCRAFT":"6",
        "TYPE ENGINE":"",
        "STATUS CODE":"",
        "MODE S CODE":"",
        "FRACT OWNER":"",
        "AIR WORTH DATE":"",
        "OTHER NAMES(1)":"",
        "OTHER NAMES(2)":"",
        "OTHER NAMES(3)":"",
        "OTHER NAMES(4)":"",
        "OTHER NAMES(5)":"",
        "EXPIRATION DATE":"",
        "UNIQUE ID":"",
        "KIT MFR":"",
        "KIT MODEL":"",
        "MODE S CODE HEX":"" // icao24
    }
}
```






