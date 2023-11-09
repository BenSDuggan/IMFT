/*
 * Code to interact with the database
 */

// TODO: Get trips for a given date range and by aircraft and destination / arrival
// TODO: Make types actually correct

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

import { logger } from "./utils/logger"
import { Flight, Organization, StateShort } from './types/structures'


//const utils = require('./utils.js');

//const databaseName = utils.config.database.name ?? "flight-test";

const DATABASE_NAME:string = "IMFTDEV";

const uri:string = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";

const DOCID_COL:{[key:string]: string} = {"oid":"organization", "lid":"location"}

export class Database {
    client:MongoClient;

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

    // Get a collection from a document ID
    documentID_collection(did:string):string {
        if(did in DOCID_COL)
            return DOCID_COL[did];

        return ""
    }

    /* Search organization
    *
    * did (string): The document to delete by its id (eg `oid` for organization)
    * term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
    * num_results (number): How many results to return
    * page (number): What page to return
    *
    * Returns: JSON object with the matched terms
    */
    async get<T extends Document>(did:string, terms:{}, num_results:number=10, page:number=0):Promise<WithId<T>[]> {
        const collection:string = this.documentID_collection(did);
        if(collection.length == 0) 
            return [];
        
        const cursor = await this.client
        .db(DATABASE_NAME)
        .collection<T>(collection)
        .find(terms)
        .skip(num_results*page)
        .limit(num_results);

        return await cursor.toArray();
    }

    /* Add the given organization to the organizations collection
    *
    * did (string): The document to delete by its id (eg `oid` for organization)
    * entry (T|T[]): The new entries to add
    *
    * Returns: true if added successfully and false otherwise
    */
    async insert<T extends Document>(did:string, entry:T|T[]): Promise<boolean> {
        const collection:string = this.documentID_collection(did);
        if(collection.length == 0) 
            return false;
        
        if(Array.isArray(entry)) {
            const result:InsertManyResult = await this.client.db(DATABASE_NAME).collection(collection).insertMany(entry);
            
            return result.acknowledged;
        }
        else {
            const result:InsertOneResult = await this.client.db(DATABASE_NAME).collection(collection).insertOne(entry);
            
            return result.acknowledged;
        }
    }

    /* Update the organization given the `oid` and updated structure
    *
    * did (string): The document to delete by its id (eg `oid` for organization)
    * id (string): The ID or list of ID to be removed
    * updates (JSON or Organization): Full organization or just the updated key-value pairs. If updating an array, the full new array must be included. For example, if adding `c` to `["a", "b"]`, then the value must be `["a", "b", "c"]`.
    *
    * Returns: true if successfully updated and false otherwise
    */
    async update(did:string, id:string, updates:object): Promise<boolean> {
        const collection:string = this.documentID_collection(did);
        if(collection.length == 0) 
            return false;

        const result:UpdateResult = await this.client.db(DATABASE_NAME).collection(collection).updateOne(
            {[did]:id},
            {$set:updates}
        );

        return result.acknowledged;
    }

    /* Delete an document
    *
    * did (string): The document to delete by its id (eg `oid` for organization)
    * id (string|string[]): The ID or list of ID to be removed
    *
    * Returns: true if successfully updated and false otherwise
    */
    async delete(did:string, id:string|string[]): Promise<boolean> {
        const collection:string = this.documentID_collection(did);
        if(collection.length == 0)
            return false;

        if(Array.isArray(id)) {
            if(id.length === 0) return false;

            let filter: { [key: string]: string }[] = id.map((i) => {return {[did]:i}});
            let result: DeleteResult = await this.client.db(DATABASE_NAME).collection(collection).deleteMany({$or:filter});
            return result.deletedCount == id.length;
        }
        else {
            let filter: { [key: string]: string } = { [did]: id };
            let result: DeleteResult = await this.client.db(DATABASE_NAME).collection(collection).deleteOne(filter);
            return result.deletedCount == 1;
        }
    }
}

export const database:Database = new Database();
