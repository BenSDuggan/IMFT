// Check if database is initialized or needs updating 

const fs = require('fs');

import { logger } from '../common/logger'
import { db } from '../database'
import { create_ffa_nnumber_collection, create_ffa_lid_collection } from './make-faa-collections'
import { collection_exists_huh } from './utils'


export const initialize_db_contents = async () => {
    // Check if `faaNNumber` needs updating
    const nnumber_exists = await collection_exists_huh('faaNNumber');
    const first_day_of_month = new Date().getDate() === 1;

    if(!nnumber_exists) {
        logger.info("initialize_db_contents: Recreating `faaNNumber` collection")
        await create_ffa_nnumber_collection();
    }
    else if (first_day_of_month) {
        logger.debug("initialize_db_contents: TODO implement update for faaNNUmber")
    }
    else {
        logger.debug("initialize_db_contents: Do not need to recreate `faaNNumber` collection")
    }

    // Check if `faaLID` needs updating
    const lid_exists = await collection_exists_huh('faaLID');

    if(!lid_exists) {
        logger.info("initialize_db_contents: Recreating `faaLID` collection")
        await create_ffa_lid_collection();
    }
    else if (first_day_of_month) {
        logger.debug("initialize_db_contents: TODO implement update for faaLID")
    }
    else {
        logger.debug("initialize_db_contents: Do not need to recreate `faaLID` collection")
    }
}
