

import { logger } from './common/logger'
import { config } from './common/config'
import * as db from './database'
import { initialize_db_contents } from './database/initialize'

import { get_opensky_data } from './adsb/opensky'
import { ADSB_State } from './types/structures'

//import { Flight, Organization, StateShort } from './types/structures'
//import './web'

// Connect to Mongo
db.connect()
.then((result) => {
    //initialize_db_contents();
})
.catch((error) => {
    console.log("opps")
    console.log(error)
}) 

get_opensky_data()
.then((result:ADSB_State) => {
    console.log(result.time);
    console.log(result.source);
    console.log(result.states.length);
    console.log(result.states[0])
})

// Initialize: ToDo
    // Initialize DB
        // Get FAA data / update if needed
        
// Get updated ADS-B data at every interval
    // For each tag, identify if new aircraft of already exists in currently tracked flights
        // If new aircraft
            // Make best determination of if this aircraft is taking off or has already been in the air
                // If already in air, see if we can concatonate this trip with another (Maybe do some tricks here to estimate how long it would take to get from last know location to current location)
            // Add to tracker list
        // Else if being tracked, update tracking information
        // Else, for tracked aircraft where data is not found, may need to consider if it has landed or data was lost