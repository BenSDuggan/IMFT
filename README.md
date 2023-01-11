# Indiana Medical Flight Tracking (IMFT)

Project to track medical helicopters in Indiana. Tweeting locations at <https://twitter.com/IN_MFT>.

## Install

1. `sudo apt install python3-pip zip`
2. Install node
    1. `curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - `
    2. `sudo apt-get install -y nodejs`
3. Install MongoDB
    1. `wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc |  gpg --dearmor | sudo tee /usr/share/keyrings/mongodb.gpg > /dev/null`
    2. `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list`
    3. `sudo apt update`
    4. `sudo apt install mongodb-org`
    5. `sudo systemctl start mongod`
    6. `sudo systemctl enable mongod`
4. Install OpenSky
    1. `git clone https://github.com/openskynetwork/opensky-api`
    2. `pip install -e opensky-api/python`


## OpenSkies

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
                "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
                "reason": "", // Reason status was changed
                "time": -1, // When the flight status was last updated
                "tics": 0, // How many intervals the flight status has been the same
                "counter": 0, // How many times the flight status has flipped
                "location": null // Location
            },
            "next": { // Tracking next status change
                "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
                "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
                "reason": "", // Reason status was changed
                "time": -1, // When the flight status was last updated
                "tics": 0, // How many intervals the flight status has been the same
                "counter": 0, // How many times the flight status has flipped
                "location": null // Location
            },
            "previous": { // Tracking previous status change
                "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
                "status": "los", // Is the aircraft: `airborn`, `grounded`, or `los`
                "reason": "", // Reason status was changed
                "time": -1, // When the flight status was last updated
                "tics": 0, // How many intervals the flight status has been the same
                "counter": 0, // How many times the flight status has flipped
                "location": null // Location
            }
        }
    }
]
```

### Trip Data Structure

Data structure for a trip which captures the path traveled from the beginning to the end of a flights path.

```
{
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
```

### How Flight Data is Managed

* Want to keep record of recent flights with data
* Want to create trips when aircraft are airborn
* Everything airborn that is being tracked needs a trip
* 


## What is a flight

### Challenges

* Aircraft can come into the airspace (from outside Indiana) and already be in flight
* Not all planes will be received during every update interval
* Assume speed and altitude data is correct
* Helicopters can hover, so if vertical speed and horizontal speed are 0, you don't know if it's hovering or not

### Flight Tracking Criteria


#### Ground status:

Determine if an aircraft is on the ground or airborne

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
