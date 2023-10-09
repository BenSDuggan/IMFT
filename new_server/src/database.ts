/*
 * Code to interact with the database
 */

// TODO: Get trips for a given date range and by aircraft and destination / arrival

import { 
    MongoClient, 
    type InsertOneResult, 
    type InsertManyResult, 
    type UpdateResult,
    type DeleteResult 
} from "mongodb"

import { logger } from "./logger"
import { Flight, Organization, StateShort } from './types/structures'

//const utils = require('./utils.js');

//const databaseName = utils.config.database.name ?? "flight-test";

const DATABASE_NAME:string = "IMFTDEV";

const uri:string = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";

export class Database {
    client: MongoClient;

    constructor() {
        // Create a new MongoClient
        this.client = new MongoClient(uri);
    }

    // Connect to the db
    async connect() {
        // Connect the client to the server (optional starting in v4.7)
        await this.client.connect();
    }

    // Disconnect from the DB
    async disconnect() {
        await this.client.close();
    }


    /* Search organization
    *
    * term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
    *
    * Returns: JSON object with the matched terms
    */
    async get_organization(terms:JSON|{}) {
        let answer:any = [];

        const cursor = await this.client.db(DATABASE_NAME).collection<Organization>("organization").find(terms);

        return await cursor.toArray();
    }

    /* Saves the given organization to the organizations collection
    *
    * organization (Organization or Organization[]): The organization to add
    *
    * Returns: true if added successfully and false otherwise
    * 
    * Example: database.save_trip({"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":1669923349,"lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":1669923944,"lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[]}).then((result) => {console.log(result)})
    */
    async insert_organization(organization:Organization|Organization[]) {
        let successfully:boolean = false;
        let count:number = 1;
        
        if(Array.isArray(organization)) {
            count = organization.length;
            const result:InsertManyResult = await this.client.db(DATABASE_NAME).collection<Organization>("organization").insertMany(organization);
            successfully = result.acknowledged;
        }
        else {
            const result:InsertOneResult = await this.client.db(DATABASE_NAME).collection<Organization>("organization").insertOne(organization);
            successfully = result.acknowledged;
        }

        if(successfully)
            logger.debug("Database: Inserted '"+count+"' organization.")
        else
            logger.error("Database: Could not insert '"+count+"' organization.")

        return successfully
    }

    /* Saves the given organization to the organizations collection
    *
    * organization (Organization or Organization[]): The organization to add
    *
    * Returns: true if added successfully and false otherwise
    */
    async update_organization(oid:string, updates:object) {
        const result:UpdateResult = await this.client.db(DATABASE_NAME).collection<Organization>("organization").updateOne(
            {"oid":oid},
            {$set:updates}
        );

        if(result.acknowledged)
            logger.debug("Database: Inserted new organization with oid: " + result.modifiedCount)
        else
            logger.error("Database: Could not insert organization with oid: " + result.modifiedCount)

        return result.acknowledged
    }

    /* Delete an organization
    *
    * oid (string|string[]): The OID or list of OIDs to be removed
    *
    * Returns: JSON object with the matched terms
    */
    async delete_organization(oid:string|string[]) {
        let result:DeleteResult;
        
        if(Array.isArray(oid)) {
            let temp:object[] = [];
            for(let o in oid) { 
                temp.push({"oid":oid[o]});
            }
            let term:object = {$or:temp};

            result = await this.client.db(DATABASE_NAME).collection<Organization>("organization").deleteMany(term);
        }
        else {
            result = await this.client.db(DATABASE_NAME).collection<Organization>("organization").deleteOne({"oid":oid});
        }

        if(result.deletedCount >= 1)
            logger.debug("Database: Deleted '" + result.deletedCount +"' organizations")
        else
            logger.error("Database: Could not delete '" + result.deletedCount + "' organizations")

        return result.deletedCount >= 1
    }
}


