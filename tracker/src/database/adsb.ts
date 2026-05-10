
import { 
    MongoClient, 
    type InsertOneResult, 
    type InsertManyResult, 
    type UpdateResult,
    type DeleteResult, 
    type Filter,
    type WithId,
    Document
} from "mongodb"

import { logger } from "../common/logger"
import { client } from './index'

import { ADSB_State } from "../types/structures";
import { config } from "../common/config";


/* Search organization
*
* term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
* num_results (number): How many results to return
* page (number): What page to return
*
* Returns: Promise to result
*/
/*
export const get_organization = async (terms:{}, num_results:number=10, page:number=0):Promise<WithId<Organization>[]> => {
    const cursor = await this.client
    .db(DATABASE_NAME)
    .collection<Organization>("organization")
    .find(terms)
    .skip(num_results*page)
    .limit(num_results);

    return await cursor.toArray();
}
*/

/* Save raw ADSB data
*
* data (json): raw adsb data, used for logging
*
* Returns: Promise to result
*/
export const adsb_raw_put = async (data:object):Promise<boolean> => {
    try {
        const result = await client
        .db(config.db.name)
        .collection("adsb_raw")
        .insertOne(data);

        logger.debug("adsb_raw_put: added new entry to `adsb_raw`")

        return result.acknowledged;
    }
    catch (err) {
        logger.error("adsb_raw_put: Error running server:", err);
        return false;
    }
}

/* Save ADSB state data
*
* data (ADSB_State): ADA-B data to save
*
* Returns: Promise to result
*/
export const adsb_put = async (data:ADSB_State):Promise<boolean> => {
    try {
        const result = await client
        .db(config.db.name)
        .collection<ADSB_State>("adsb")
        .insertOne(data);

        logger.debug("adsb_put: added new entry to `adsb`")

        return result.acknowledged;
    }
    catch (err) {
        logger.error("adsb_put: Error running server:", err);
        return false;
    }
}
