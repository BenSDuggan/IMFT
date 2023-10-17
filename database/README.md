# Database

Uses MongoDB

## Install

Server install instructions can be found [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/).

1. `xcode-select --install`
2. `brew tap mongodb/brew`
3. `brew update`
4. `brew install mongodb-community@6.0`


## MongoDB Commands

* Start service: `brew services start mongodb-community@6.0`
* Stop service: `brew services stop mongodb-community@6.0`
* Start shell: `mongosh`
    * View databases: `show dbs`
    * Create/enter database: `use <name>`
    * Implicitly write/create collection: `db.user.insertOne({name: "Ada Lovelace", age: 205})`
    * Explicitly create collection: `` <https://www.mongodb.com/docs/manual/reference/method/db.createCollection/>
    * Drop collection: `db.<collection to drop>.drop()`. Will return `true` if deleted

## Collections

### Overview 

* `trips`: Stores each of the trips
* `aircraft`: Stores each of the aircraft. The aircraft can be manually added or automatically added if they land at a hospital. Only `icao24`s stored in this collection will be shown to the clients. Much of this data is copied from the FAA N-Number registry
* `hospitals`: Stores each of the hospitals. These are different from the FAA LIDs, but often overlap. Hospitals include additional information and must be added manually. However, they are should be used over FAA LIDs. Hospitals can be linked to multiple LIDs.
* `faaNNumber`: Copy of the FAA N-Number aircraft registry. Should be updated periodically.
* `faaLID`: Copy of the FAA LID airport registry. Should be updated periodically. Used to search for the location of aircraft.


### Trips

Stores all of the individual trips.

#### Structure

```
{
    "tid":-1, // Trip ID
    "status":"", // `grounded` `airborn` `los`
    "aircraft": { // Aircraft information
      "aid":-1, // Aircraft ID
      "N-NUMBER": null, // Aircraft N-Number
      "display_name": "", // Aircraft name or display name
    },
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


#### Sample data: IUH North (Clarion North Medical Center) -> Indianapolis Heliport

```
{"tid":"4d5361a3-9f19-4109-8e22-a3e7c8f26383","aid":"a1709e","status":"los","departure":{"lid":"IN73","type":"faaLID","display_name":"CLARION NORTH MEDICAL CENTER","time":1669923726,"lat":39.9499,"lon":-86.1654,"distance":3647.4668201352993},"arrival":{"lid":"indianapolis_heliport","type":"hospital","display_name":"Indianapolis Heliport / IUH University","time":1669924377,"lat":39.7663,"lon":-86.1448,"distance":1110.2771365133844},"stats":{"time":350,"distance":67852.6470880894},"path":[[39.9499,-86.1654],[39.9499,-86.1654],[39.937,-86.1621],[39.9335,-86.1613],[39.9252,-86.1597],[39.9252,-86.1597],[39.9177,-86.1587],[39.9101,-86.1577],[39.9043,-86.1569],[39.8997,-86.1564],[39.8946,-86.1559],[39.8889,-86.1552],[39.8889,-86.1552],[39.8726,-86.1533],[39.8663,-86.1525],[39.8605,-86.152],[39.8563,-86.1517],[39.8486,-86.1508],[39.843,-86.15],[39.8374,-86.1492],[39.8277,-86.1479],[39.8231,-86.1472],[39.8154,-86.1459],[39.8098,-86.1451],[39.8034,-86.1445],[39.7973,-86.1437],[39.7943,-86.1432],[39.7869,-86.1419],[39.7822,-86.1411],[39.7767,-86.1405],[39.7717,-86.1404],[39.7695,-86.141],[39.7669,-86.1435],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448]]}
```


### Hospitals data structure

Where the hospitals are located and bounding boxes for them.

```
[
    {
    "_id": , // Object ID
    "id": "", // ID name of the hospital *unique*
    "display-name": "", // Name to use when addressing the hospital
    "lat": "", // Hospital latitude
    "long": "", // Hospital longitude
    "zone1": { // Closest zone with highest confidence of arrival
        "radius": 0, // Radius of zone from lat/long
        "ceiling": 0, // Height limit for zone
    }
]
```

### FAA Helicopter Registration

FAA aircraft registration, but only rotor craft. Taken from <https://registry.faa.gov/database/ReleasableAircraft.zip> and <https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/releasable_aircraft_download>.

```
[
    {
    "N-NUMBER":"",
    "SERIAL NUMBER":"",
    "MFR MDL CODE":"",
    "ENG MFR MDL":"",
    "YEAR MFR":"",
    "TYPE REGISTRANT":"",
    "NAME":"",
    "STREET":"",
    "STREET2":"",
    "CITY":"",
    "STATE":"",
    "ZIP CODE":"",
    "REGION":"",
    "COUNTY":"",
    "COUNTRY":"",
    "LAST ACTION DATE":"",
    "CERT ISSUE DATE":"",
    "CERTIFICATION":"",
    "TYPE AIRCRAFT":"6",
    "TYPE ENGINE":"",
    "STATUS CODE":"",
    "MODE S CODE":"",
    "FRACT OWNER":"",
    "AIR WORTH DATE":"",
    "OTHER NAMES(1)":"",
    "OTHER NAMES(2)":"",
    "OTHER NAMES(3)":"",
    "OTHER NAMES(4)":"",
    "OTHER NAMES(5)":"",
    "EXPIRATION DATE":"",
    "UNIQUE ID":"",
    "KIT MFR":"",
    "KIT MODEL":"",
    "MODE S CODE HEX":"" // icao24
    }
]
```

## FAA Location Identification (Airport Location)

FAA database of all airports. Only interested in FFA LID, `ARPT_NAME` (location name), `SITE_TYPE_CODE` latitude, longitude, city, and state. Data is found from this page <https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription_2022-12-29/>. Zip available from <https://nfdc.faa.gov/webContent/28DaySub/extra/29_Dec_2022_APT_CSV.zip>. Data is stored in the `APT_BASE.csv` file.



