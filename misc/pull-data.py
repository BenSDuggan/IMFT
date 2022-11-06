# Pull data from the OpenSky API at regular intervals

import json, time
from opensky_api import OpenSkyApi

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)
interval = 60 # sec
filename = "test-file.json"

flights = []
api = OpenSkyApi()

while True:
    states = api.get_states(bbox=bbox)

    #for s in states.states:
    #    print("(%r, %r, %r, %r)" % (s.longitude, s.latitude, s.baro_altitude, s.velocity))
    
    print("%r: N=%r" % (states.time, len(states.states)))
    flight = {"time":states.time, "states":[]}
    
    for s in states.states:
        flight["states"].append(s.__dict__)

    flights.append(flight)

    with open(filename, "w") as file:
        json.dump(flights, file)

    time.sleep(interval)
