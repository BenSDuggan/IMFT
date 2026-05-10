// Record ADSB data from different sources at different rates

import { ADSB_State } from "../types/structures";

import { logger } from '../common/logger'
import { config } from '../common/config'
import { get_opensky_data } from "./opensky";
import { run_historic_data } from "./historic";



export let set_query_interval = async ():Promise<undefined> => {
    try {
        // Get updated data
        //let data:ADSB_State = await get_opensky_data();
        //console.log(data.states.length)

        run_historic_data();

        return ;

    }
    catch(err) {
        logger.error("run_fa: Error running server:", err);
    }
}

