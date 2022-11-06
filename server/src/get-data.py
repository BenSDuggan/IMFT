# Pull data from the OpenSky API at regular intervals

import json, time
from opensky_api import OpenSkyApi

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)
filename = "curr-flights.json"

api = OpenSkyApi()
states = api.get_states(bbox=bbox)

print("%r: N=%r" % (states.time, len(states.states)))
flights = {"time":states.time, "states":[]}

for s in states.states:
    flights["states"].append(s.__dict__)

with open(filename, "w") as file:
    json.dump(flights, file)