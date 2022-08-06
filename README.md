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