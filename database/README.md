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
    * Implicitly write/create collection: `db.user.insert({name: "Ada Lovelace", age: 205})`
    * Explicitly create collection: `` <https://www.mongodb.com/docs/manual/reference/method/db.createCollection/>

## Create DB structure using mongosh

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

FAA aircraft registration, but only rotor craft. Taken from <https://registry.faa.gov/database/ReleasableAircraft.zip>.

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

