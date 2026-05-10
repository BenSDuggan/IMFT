

import { logger } from './common/logger'
import { config } from './common/config'
import * as db from './database'
import { initialize_db_contents } from './database/initialize'

import { get_opensky_data } from './adsb/opensky'
import { ADSB_State } from './types/structures'
import { set_query_interval } from './adsb/recorder'
import { get_adsb_exchange_data } from './adsb/adsb-exchange'

//import { Flight, Organization, StateShort } from './types/structures'


const init_fa = async () => {
    try {
        // Initialize DB
        await db.connect();
        await initialize_db_contents();

        // Get last set of flights / trips and load them
        // TODO
    } 
    catch (err) {
        logger.error("init_fa: Error initializing data:", err);
    }
}

const loop_fa = async() => {
    //get_adsb_exchange_data();
}

// Initialize and run FA
const run_fa = async () => {
    try {
        // Initialize
        await init_fa();

        await loop_fa();
    } 
    catch (err) {
        logger.error("run_fa: Error running server:", err);
    }
}

// Detect if server is exiting from keyboard interrupt
process.on('SIGINT', async () => {
  logger.info("Server stopping...");
  await db.disconnect();

  logger.info("Server stopped");

  process.exit();
});

run_fa();


// Get updated ADS-B data at every interval
    // For each tag, identify if new aircraft of already exists in currently tracked flights
        // If new aircraft
            // Make best determination of if this aircraft is taking off or has already been in the air
                // If already in air, see if we can concatonate this trip with another (Maybe do some tricks here to estimate how long it would take to get from last know location to current location)
            // Add to tracker list
        // Else if being tracked, update tracking information
        // Else, for tracked aircraft where data is not found, may need to consider if it has landed or data was lost
    