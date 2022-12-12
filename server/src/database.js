/*
 * Code to interact with the database
 */


const { MongoClient } = require("mongodb");

const { logger } = require('./logger.js')

const databaseName = "flight-test"

const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";


let Database = class {
    constructor() {
        // Create a new MongoClient
        this.client = new MongoClient(uri);
        this.connection = null;

        this.hospitals = [];
    }

    // Connect to the db
    async connect() {
        // Connect the client to the server (optional starting in v4.7)
        this.connection = await this.client.connect();
    }

    // Disconnect from the DB
    async disconnect() {
        await connection.close();
    }

    /* Get all the hospitals in the system
    *
    * Returns: Array with JSON elements containing the hospital system
    */
    async get_hospitals() {
        this.hospitals = [];

        // Insert hospitals
        const cursor = await this.client.db(databaseName).collection("hospitals").find();

        await cursor.forEach((h) => {
            delete h["_id"];
            this.hospitals.push(h);
        });

        return this.hospitals;
    }

    /* Get all the hospitals in the system
    *
    * term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
    *
    * Returns: JSON object with the first matched term
    * 
    * Example: `database.get_faa_registration({"MODE S CODE HEX":"A16CE7"}).then((results) => console.log(results))`
    */
    async get_faa_registration(term) {
        let answer = null;

        const cursor = await this.client.db(databaseName).collection("faa").find(term);
        //console.log(cursor)
        await cursor.forEach((r) => {
            if(answer != null) console.log("Multiple entries matched")
            else answer = r;
        });

        return answer;
    }
}

const database = new Database()

database.connect().then((result) => {
    logger.info("Connected to the database")
    return database.get_hospitals()
  }).then((result) => {
    logger.verbose("Got Hospitals: " + result.length)
  })

module.exports = { database };