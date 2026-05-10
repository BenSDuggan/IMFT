// Get data from open sky network

import { readFileSync, existsSync } from 'fs'

import { config } from '../common/config'
import { logger } from "../common/logger";
import { epoch_s } from "../common/utils";

import { ADSB_State, Aircraft_State } from "../types/structures";

const update_access_time:number = 25 * 60; // Get new access token every 25 minutes

let access_token:string = "";
let access_token_expires_time:number = 0;


// Load historic data
export const load_historic_data = async ():Promise<boolean> => {
    try {
        if(!config.adsb.historic?.path) 
            return false;

        let historic_file = JSON.parse(readFileSync(config.adsb.historic?.path, 'utf8'));

        logger.info(`Loaded historic file named '${historic_file["name"]}' from '${config.adsb.historic?.path}' with ${historic_file["num-flights"]} flights`)

        return true;
    } catch (err) {
        logger.error("load_historic_data: Error loading data:", err);
        return false;
    }
}

// Run historic data
export const run_historic_data = async ():Promise<ADSB_State> => {
    let state:ADSB_State = {
        time:0,
        states:[],
        source:"opensky"
    }

    try {
        load_historic_data();
        
    } catch (err) {
        logger.error("run_historic_data: Error fetching data:", err);
    }

    return state;
}

