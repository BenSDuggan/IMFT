# Pull data from the OpenSky API at regular intervals, and save it in test data format

import json, time
from opensky_api import OpenSkyApi

filename = "test-data.json"

# bbox = (min latitude, max latitude, min longitude, max longitude)
bbox = (37.80122453312876, 41.761724847409944, -88.02821002978239, -84.80904449801197)

test_data = {
    "name":"Wednesday September 7, 2022 OpenSkys Data 50 Flights",
    "bbox": bbox,
    "start-time": int(time.time()),
    "end-time": None,
    "num-flights": 50,
    "interval": 10,
    "flights": {}
}


api = OpenSkyApi()
count = 0

try:
    while count < test_data["num-flights"]:
        states = api.get_states(bbox=bbox)

        flights = {"time":states.time, "states":[]}

        for s in states.states:
            flights["states"].append(s.__dict__)

        test_data["flights"][states.time] = flights

        count = count + 1
        print("%d / %d: %d" % (count, test_data["num-flights"], states.time))
        time.sleep(test_data["interval"])
    
except:
    print("Failed")

test_data["end-time"] = int(time.time())


with open(filename, "w") as file:
    json.dump(test_data, file)