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

### Documentation

<https://openskynetwork.github.io/opensky-api/rest.html>

### Quota

* OpenSkies:
    * Antonymous 100 / day
    * Signed in 1000 / day
    * Can get your data from your sensor unlimited
* ADS-B Exchange $10 / mo
    * 10,000
    * Best coverage in Indianapolis
* Flight Aware 
    * $20 / mo

## Data structures

### Flights data structure

Used by server and client to store the locations of aircraft.

```
[
    {
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
                "location": "" // Location
            },
            "next": { // Tracking next status change
                "status": "", // Is the aircraft: `airborn`, `grounded`, or `los`
                "time": -1, // When the flight status was last updated
                "tics": 0, // How many intervals the flight status has been the same
                "counter": 0, // How many times the next status has flipped
            }
        }
    }
]
```

## What is a flight

### Challenges

* Aircraft can come into the airspace (from outside Indiana) and already be in flight
* Not all planes will be received during every update interval
* Assume speed and altitude data is correct
* Helicopters can hover, so if vertical speed and horizontal speed are 0, you don't know if it's hovering or not

### Flight Tracking Criteria

* Airborn (easier to tell than on ground) if any of the criteria are met
    * Vertical speed > 1 m/s
    * Horizontal speed > 1 m/s
    * True altitude > 250
* Grounded:
    * `on-ground` is true
    * Aircraft is within Zone 1 of a hospital: ~ 1000 ft radius and 500 ft vertical ceiling
        * *Some exceptions like Eski and Riley*
    * ***Assume that helicopters won't hover***
* LOS (loss of signal): No updated data for 2 minutes or 5 intervals, which ever is less
    * If LOS, see if aircraft is within zone 2 of hospital. If more than one result, pick the hospital with the shortest distance

* Status will not change unless 2 consecutive new status have been observed
