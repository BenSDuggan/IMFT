# Indiana Medical Flight Tracking (IMFT)

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

### Quota

* Antonymous 100
* Signed in 1000
* Can get your data from your sensor unlimited


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
        "onGround": false, // Is aircraft on the ground
        "inAir": false, // Is the aircraft in the air
        "airGroundJustChanged": false, // Did air or ground just change?
        "labeledLocation": null // Name of where the aircraft actually is
    }
]
```

## What is a flight

### Challenges

* Aircraft can come into the airspace (from outside Indiana) and already be in flight
* Not all planes will be received during every update interval
* Assume speed and altitude data is correct

### Flight Tracking Criteria

* LOS (loss of signal): No updated data in 5 minutes
* Airborn (easier to tell than on ground) if any of the criteria are met
    * Vertical speed > 1 m/s
    * Horizontal speed > 1 m/s
    * Altitude > 250
    * 
* Grounded:
    * `on-ground` is true
    * Criteria to be airborn are not met



