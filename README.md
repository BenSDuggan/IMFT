# Flight alert

Project to track medical helicopters in Indiana


## OpenSky Method

### Install

1. `git clone https://github.com/openskynetwork/opensky-api`
2. `pip install -e opensky-api/python`
3. Test the code using:
```
from opensky_api import OpenSkyApi
api = OpenSkyApi()
s = api.get_states()
print(s)
```


## Data structures

### Flights data structure

Used by server and client to store the locations of aircraft.

```
[
    {
        "icao24": "" // The icao24
        "last":{}, // Data from the last update interval
        "stl":{}, // Data from the second to last interval (copied from last when the next update interval occurs)
        "latest":{}, // Latest data received, not necessarily up to date
        "lastUpdated": -1, // Time that the last flight data was received
        "updated": false // Updated on this last time interval
    }
]
```

### Hospitals data structure

```
{
    <name>: {
        "display-name": "", // Name to use when addressing the hospital
        "lat": "", // Hospital latitude
        "long": "", // Hospital longitude
        "zone1": { // Closest zone with highest confidence of arrival
            "radius": 0, // Radius of zone from lat/long
            "ceiling": 0, // Height limit for zone
        },
    }
}
```

## What is a flight

### Challenges

* People can come into the airspace (from outside Indiana) and already be in flight
* Not all planes will be received during every update interval
* Assume speed and altitude data is correct

### Criteria

* Take off:
    * Case 1: Known status was on ground
    * Previous known altitude < 50 ft
    * If no previous known altitude then altitude 

    * Case 1: Was on ground, now not
        * Previously listed as `on ground`
        * Now not listed as `on-ground`
    * Case 2: Flight data shows on ground, but looks like its not now
        * Wasn't in air for a while
        * Altitude > 50 ft
    * Case 3: 
        * Previously in air
        * Lost contact with aircraft
        * Altitude < 250 ft now
* In air:
    * Speed > 10 m/s
    * Altitude > 750 ft
* Landed:
    * Case 1: Confirmed on ground
        * Previously in air
        * Now listed as `on-ground`
    * Case 2: Flight data shows on ground
        * Previously in air
        * Speed = 0 m/s
        * Altitude < 250 ft
    * Case 3: Lost contact, but likely on ground
        * Previously in air
        * Lost contact with aircraft
        * Altitude < 250 ft now
    
## Notes

* Units are in ft unless specified