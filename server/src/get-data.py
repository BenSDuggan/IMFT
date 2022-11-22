# Pull data from the OpenSky API at regular intervals

import os, json, time
from opensky_api import OpenSkyApi

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)
filename = "curr-flights.json"
config_file = "~/.config/opensky.json"

username, password = None, None
# Load config
with open(os.path.expanduser(config_file), "r") as file:
    config = json.load(file)
    username, password = config["username"], config["password"]


api = OpenSkyApi(username=username, password=password)
states = api.get_states(bbox=bbox)

if states == None:
    raise ValueError("Missing data")

print("%r: N=%r" % (states.time, len(states.states)))
flights = {"time":states.time, "states":[]}

for s in states.states:
    flights["states"].append(s.__dict__)

with open(filename, "w") as file:
    json.dump(flights, file)