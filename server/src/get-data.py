# Pull data from the OpenSky API at regular intervals
# Must provide path to save data

import os, json, sys
from opensky_api import OpenSkyApi

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)
filename = sys.argv[1]
config_file = "~/.config/imft/config.json"
print(sys.argv)

username, password = None, None
# Load config
with open(os.path.expanduser(config_file), "r") as file:
    config = json.load(file)
    opensky_config = config["adsb"]["opensky"]
    username, password = opensky_config["username"], opensky_config["password"]


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

sys.stdout.flush()