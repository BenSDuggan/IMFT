/*
 * Code to interact with the database
 */

// TODO: Get trips for a given date range and by aircraft and destination / arrival

import { 
    MongoClient, 
    type InsertOneResult, 
    type InsertManyResult, 
    type UpdateResult,
    type DeleteResult, 
    type Filter,
    Document
} from "mongodb"

import { logger } from "./logger"
import { Flight, Organization, StateShort } from './types/structures'
import exp from "constants";


//const utils = require('./utils.js');

//const databaseName = utils.config.database.name ?? "flight-test";

const DATABASE_NAME:string = "IMFTDEV";

const uri:string = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";


export class Database {
    client: MongoClient;

    constructor() {
        this.client = new MongoClient(uri); // Create a new MongoClient
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
    async get_organizations(terms:JSON|{}) {
        let answer:any = [];

        const cursor = await this.client.db(DATABASE_NAME).collection<Organization>("organization").find(terms);

        return await cursor.toArray();
    }

    /* Add the given organization to the organizations collection
    *
    * organization (Organization or Organization[]): The organization to add
    *
    * Returns: true if added successfully and false otherwise
    */
    async insert_organization(organization:Organization|Organization[]) {
        let successful:boolean = false;
        let count:number = 1;
        
        if(Array.isArray(organization)) {
            count = organization.length;
            const result:InsertManyResult = await this.client.db(DATABASE_NAME).collection<Organization>("organization").insertMany(organization);
            successful = result.acknowledged;
        }
        else {
            const result:InsertOneResult = await this.client.db(DATABASE_NAME).collection<Organization>("organization").insertOne(organization);
            successful = result.acknowledged;
        }

        if(successful)
            logger.debug("Database: Inserted '"+count+"' organization.")
        else
            logger.error("Database: Could not insert '"+count+"' organization.")

        return successful
    }

    /* Update the organization given the `oid` and updated structure
    *
    * oid (string): The `oid` of the organization to update
    * updates (JSON or Organization): Full organization or just the updated key-value pairs. If updating an array, the full new array must be included. For example, if adding `c` to `["a", "b"]`, then the value must be `["a", "b", "c"]`.
    *
    * Returns: true if successfully updated and false otherwise
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
    * Returns: true if successfully updated and false otherwise
    */
    async delete_organization(oid:string|string[]): Promise<boolean> {
        let result:DeleteResult;
        let expected_number:number = 1;
        
        if(Array.isArray(oid)) {
            let term:object = {$or:oid.map((o) => {return {"oid":o}})};
            expected_number = oid.length;

            result = await this.client.db(DATABASE_NAME).collection<Organization>("organization").deleteMany(term);
        }
        else {
            result = await this.client.db(DATABASE_NAME).collection<Organization>("organization").deleteOne({"oid":oid});
        }

        if(result.deletedCount === expected_number)
            logger.debug("Database: Deleted '" + result.deletedCount +"' organizations")
        else
            logger.error("Database: Could not delete '" + result.deletedCount + "' organizations")

        return result.deletedCount === expected_number
    }

    async delete(col:string, ids:string|string[]): Promise<boolean> {
        if(Array.isArray(ids)) {
            //if(ids.length === 0) return false;

            let filter: { [key: string]: string }[] = ids.map((i) => {return {[col]:i}});
            let result: DeleteResult = await this.client.db(DATABASE_NAME).collection("organization").deleteMany({$or:filter});
            return result.deletedCount == ids.length;
        }
        else {
            let filter: { [key: string]: string } = { [col]: ids };
            let result: DeleteResult = await this.client.db(DATABASE_NAME).collection("organization").deleteOne(filter);
            return result.deletedCount == 1;
        }
    }

    async delete_one(col: string, ids: string): Promise<boolean> {
        let filter: { [key: string]: string } = { [col]: ids };
        let result: DeleteResult = await this.client.db(DATABASE_NAME).collection("organization").deleteOne(filter);
        return result.deletedCount > 0;
    }

    async delete_many(col: string, ids: string[]): Promise<boolean> {
        let filter: { [key: string]: string }[] = ids.map((i) => {return {[col]:i}});
        let result: DeleteResult = await this.client.db(DATABASE_NAME).collection("organization").deleteMany({$or:filter});
        return result.deletedCount > 0;
    }

    /* Delete an organization
    *
    * oid (string|string[]): The OID or list of OIDs to be removed
    *
    * Returns: true if successfully updated and false otherwise
    */
   /*
    async delete<Type extends Document>(key:string, id:string|string[]): Promise<boolean> {
        let result:DeleteResult;
        let expected_number:number = 1;
        
        if(Array.isArray(id)) {
            let term = {$or:id.map((i) => {return {key:i}})};
            expected_number = id.length;

            result = await this.client.db(DATABASE_NAME).collection<Type>("organization").deleteMany(term);
        }
        else {
            const query = { key: id };
            result = await this.client.db(DATABASE_NAME).collection<Type>("organization").deleteOne({query});
        }

        if(result.deletedCount === expected_number)
            logger.debug("Database: Deleted '" + result.deletedCount +"' organizations")
        else
            logger.error("Database: Could not delete '" + result.deletedCount + "' organizations")

        return result.deletedCount === expected_number
    }
    */
}

export const database:Database = new Database();
