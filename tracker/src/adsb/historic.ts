// Get data from open sky network

import { readFileSync, writeFile } from 'fs'

import { config } from '../common/config'
import { logger } from "../common/logger";
import { epoch, epoch_s } from "../common/utils";

import { ADSB_State, Aircraft_State } from "../types/structures";
import { get_adsb_exchange_data } from './adsb-exchange';
import { get_opensky_data } from './opensky';
import { io } from "../web"

let hd:any = {
        "name": "", 
        "source": "",
        "start_time": -1, 
        "end_time": -1, 
        "num_flights": -1, 
        "interval": -1, 
        "flights":[]
    };
let count:number = 0;
let interval_id:any = 0;

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

const run_historic_collector = async () => {
    try {
        console.log(`Running interval ${count + 1}/${hd.num_flights}`);
        let data:ADSB_State;

        if(hd.source == "opensky") {
            data = await get_opensky_data();
        }
        else if(hd.source == "adsb-exchange") {
            data = await get_adsb_exchange_data();
        }
        else {
            logger.error("create_historic_data: unsupported logger source given.")
            return;
        }

        hd.flights.push(data);

        count++;

        // Save after every request (safer)
        await writeFile(
            `../data/test-data/${hd.source}_${hd.num_flights}_${new Date().toISOString().split('T')[0]}.json`,
            JSON.stringify(hd, null, 2),
            (d) => {}
        );

        logger.info(`run_historic_collector: Run ${count}/${hd.num_flights}. Saved ${data.states.length} flights`)

        if (count >= hd.num_flights) {
            logger.info("run_historic_collector: Finished all intervals");
            clearInterval(interval_id);
        }
        
    } catch (err) {
        logger.error("run_historic_collector: Error creating historic data:", err);
    }
}

// Create historic data
export const create_historic_data = async (source: string, num_flights:number, interval:number) => {
    hd["start_time"] = epoch();
    hd["interval"] = interval;
    hd["num_flights"] = num_flights;
    hd["source"] = source;

    if(source == "opensky") {
        let d = new Date();
        hd["name"] = `${d.toISOString().split('T')[0]} OpenSkys HD ${num_flights}@${interval}`;
        hd["bbox"] = [config.grid.lat_min, config.grid.lat_max, config.grid.lon_min, config.grid.lon_max];
    }
    else if(source == "adsb-exchange") {
        let d = new Date();
        hd["name"] = `${d.getFullYear()}/${d.getMonth()}/${d.getDay()} ADSB Exchange HD ${num_flights}@${interval}`;
        hd["center"] = [config.center_point.lat, config.center_point.lon];
    }
    else {
        logger.error("create_historic_data: unsupported logger source given.")
        return;
    }

    try {
        run_historic_collector();

        // Then continue every 30 seconds
        interval_id = setInterval(run_historic_collector, interval* 1000);
        hd["end_time"] = epoch();
        
    } catch (err) {
        logger.error("create_historic_data: Error creating historic data:", err);
    }
}

