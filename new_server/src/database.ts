/*
 * Code to interact with the database
 */

// TODO: Get trips for a given date range and by aircraft and destination / arrival


import { logger } from './logger.js'
//const utils = require('./utils.js');

import { MongoClient } from "mongodb"

//const databaseName = utils.config.database.name ?? "flight-test";

const uri:string = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";

console.log("morning")

let database:string="be"

export { database };

