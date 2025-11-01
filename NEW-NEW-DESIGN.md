# New Design Late 2025

* Tracker: This is the main service which pulls ADS-B data and keeps track of flights
    * Config: It's best to use the [config.json](./data/config.json) file for setttings.  Environment variables can be used but have limited support.

* General flow:
    * Initialize: ToDo
    * Get updated ADS-B data at every interval
        * For each tag, identify if new aircraft of already exists in currently tracked flights
            * If new aircraft
                * Make best determination of if this aircraft is taking off or has already been in the air
                    * If already in air, see if we can concatonate this trip with another (Maybe do some tricks here to estimate how long it would take to get from last know location to current location)
                * Add to tracker list
            * Else if being tracked, update tracking information
            * Else, for tracked aircraft where data is not found, may need to consider if it has landed or data was lost
* Kentucky boundaries:
    * North most point: 39.148272074382874, -84.74506659556191
    * South most point: 36.496806738561204, -88.05428693136786
    * East most point: 37.54351474648002, -81.96508576241122
    * West most point: 36.558830625914545, -89.57068050021296
    * Lat range: 36.558830 - 39.148272
        * Distance between lat: 287 km
    * Long range: -81.965085 - -89.570680
        * Distance between long: 655 km


## Database

* MongoDB is used for the database
* The main database is called `mft`
* Collections
    * `trips`: Stores each of the trips
    * `aircraft`: Stores each of the aircraft. The aircraft can be manually added or automatically added if they land at a hospital. Only `icao24`s stored in this collection will be shown to the clients. Much of this data is copied from the FAA N-Number registry
    * `locations`: Stores each of the hospitals. These are different from the FAA LIDs, but often overlap. Hospitals include additional information and must be added manually. However, they are should be used over FAA LIDs. Hospitals can be linked to multiple LIDs.
    * `faaNNumber`: Copy of the FAA N-Number aircraft registry. Should be updated periodically.
    * `faaLID`: Copy of the FAA LID airport registry. Should be updated periodically. Used to search for the location of aircraft.

### FAA Helicopter Registration (`faaNNumber`)

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


* FAA database of all airports. Main FAA page with all data (https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/).
* Only interested in FFA LID, `ARPT_NAME` (location name), `SITE_TYPE_CODE` latitude, longitude, city, and state. 
* Old data is found from this page <https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription_2022-12-29/>. Zip available from <https://nfdc.faa.gov/webContent/28DaySub/extra/29_Dec_2022_APT_CSV.zip>. 
* New URL <https://nfdc.faa.gov/webContent/28DaySub/extra/30_Oct_2025_CSV.zip>
* They unfortunately do not have a most up to date link or easy way to pull up to date data like for N Number. 
* Data is stored in the `APT_BASE.csv` file.

## ToDo
[ ] Database
    [ ] LID airports: if first of the month and want to get new data, test all dates with link
    [ ] N Number: if updating, then update aircraft collection with data if its different
