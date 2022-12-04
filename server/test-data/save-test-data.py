# Pull data from the OpenSky API at regular intervals, and save it in test data format

import os, json, time
from opensky_api import OpenSkyApi

config_file = "~/.config/opensky.json"
filename = "test-data.json"
num_flights = 200

username, password = None, None
# Load config
with open(os.path.expanduser(config_file), "r") as file:
    config = json.load(file)
    username, password = config["username"], config["password"]

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)

test_data = {
    "name":"Thursday December 1, 2022 OpenSkys Data 500 Flights",
    "bbox": bbox,
    "start-time": int(time.time()),
    "end-time": None,
    "num-flights": -1,
    "interval": 10,
    "flights": {}
}


api = OpenSkyApi(username=username, password=password)
count = 0

try:
    while count < num_flights:
        states = api.get_states(bbox=bbox)

        flights = {"time":states.time, "states":[]} 

        for s in states.states:
            flights["states"].append(s.__dict__)

        test_data["flights"][states.time] = flights

        count = count + 1
        print("%d / %d: %d" % (count, num_flights, states.time))
        time.sleep(test_data["interval"])
    
except Exception as e:
    print("Failed")
    print(e)

test_data["end-time"] = int(time.time())
test_data["num-flights"] = len(test_data["flights"])

with open(filename, "w") as file:
    json.dump(test_data, file)