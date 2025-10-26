
import { 
    MongoClient,
    Db
} from "mongodb"

import { logger } from "../common/logger"
import { config } from "../common/config"


export const DATABASE_NAME:string = config.db.name;

let uri:string = "";

if(config.db.user === "") {
    uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
}
else {
    uri = 'mongodb://' + 
    config.db.user + ':' +
    config.db.pass + '@' + 
    config.db.host + ':' + 
    config.db.port + '/' + 
    config.db.name + '?maxPoolSize=20&w=majority';
}

export const client:MongoClient = new MongoClient(uri); // Create a new MongoClient
export let db:Db;

// Connect to the db
export const connect = () => {
    // Connect the client to the server (optional starting in v4.7)
    return client.connect()
    .then((value) => {
        db = client.db(config.db.name);
        logger.info("database.connect: Mongo DB connected")
        return true
    })
    .catch((error) => {
        logger.error("database.connect: Mongo DB could not connect " + error)
        return error;
    })
}

// Disconnect from the DB
export const disconnect = () => {
    client.close()
    .then((value) => {
        logger.info("database.disconnect: Mongo DB disconnected")
        return true
    })
    .catch((error) => {
        logger.error("database.disconnect: Mongo DB could not disconnect " + error)
        return error;
    })
}


