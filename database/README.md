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
    * Drop collection: `db.<collection to drop>.drop()`. Will return `true` if deleted

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


## Trips

### Sample data

#### Unknown -> Riley

```
{"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":1669923349,"lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":1669923944,"lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[[39.9414,-85.8842],[39.9385,-85.8894],[39.9347,-85.8962],[39.9301,-85.9047],[39.9269,-85.9105],[39.9239,-85.916],[39.9205,-85.9222],[39.9188,-85.9253],[39.9188,-85.9253],[39.911,-85.9394],[39.9076,-85.9457],[39.9034,-85.9533],[39.8991,-85.961],[39.8974,-85.9641],[39.8941,-85.97],[39.8894,-85.9784],[39.8871,-85.9826],[39.8826,-85.9908],[39.8793,-85.9966],[39.8762,-86.0022],[39.8721,-86.0096],[39.8691,-86.0152],[39.8652,-86.0222],[39.8624,-86.0274],[39.8624,-86.0274],[39.8555,-86.0399],[39.8521,-86.046],[39.8477,-86.0539],[39.8477,-86.0539],[39.8477,-86.0539],[39.8396,-86.0685],[39.8396,-86.0685],[39.8396,-86.0685],[39.8311,-86.084],[39.8247,-86.0955],[39.8211,-86.1022],[39.8188,-86.1062],[39.8144,-86.1142],[39.8112,-86.1199],[39.8077,-86.1269],[39.8059,-86.1345],[39.8052,-86.1398],[39.8044,-86.1462],[39.8034,-86.1537],[39.8023,-86.1613],[39.7989,-86.168],[39.7946,-86.1698],[39.7904,-86.1708],[39.7865,-86.172],[39.784,-86.174],[39.7821,-86.1774],[39.7811,-86.1788],[39.7797,-86.1796],[39.7793,-86.1797],[39.7793,-86.1797],[39.778,-86.1799]]}
```

#### IUH North (Clarion North Medical Center) -> Indianapolis Heliport

```
{"tid":"4d5361a3-9f19-4109-8e22-a3e7c8f26383","aid":"a1709e","status":"los","departure":{"lid":"IN73","type":"faaLID","display_name":"CLARION NORTH MEDICAL CENTER","time":1669923726,"lat":39.9499,"lon":-86.1654,"distance":3647.4668201352993},"arrival":{"lid":"indianapolis_heliport","type":"hospital","display_name":"Indianapolis Heliport / IUH University","time":1669924377,"lat":39.7663,"lon":-86.1448,"distance":1110.2771365133844},"stats":{"time":350,"distance":67852.6470880894},"path":[[39.9499,-86.1654],[39.9499,-86.1654],[39.937,-86.1621],[39.9335,-86.1613],[39.9252,-86.1597],[39.9252,-86.1597],[39.9177,-86.1587],[39.9101,-86.1577],[39.9043,-86.1569],[39.8997,-86.1564],[39.8946,-86.1559],[39.8889,-86.1552],[39.8889,-86.1552],[39.8726,-86.1533],[39.8663,-86.1525],[39.8605,-86.152],[39.8563,-86.1517],[39.8486,-86.1508],[39.843,-86.15],[39.8374,-86.1492],[39.8277,-86.1479],[39.8231,-86.1472],[39.8154,-86.1459],[39.8098,-86.1451],[39.8034,-86.1445],[39.7973,-86.1437],[39.7943,-86.1432],[39.7869,-86.1419],[39.7822,-86.1411],[39.7767,-86.1405],[39.7717,-86.1404],[39.7695,-86.141],[39.7669,-86.1435],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448],[39.7663,-86.1448]]}
```
