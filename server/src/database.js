/*
 * Code to interact with the database
 */


const { MongoClient } = require("mongodb");

const databaseName = "flight-test"

const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";


let Database = class {
    constructor() {
        // Create a new MongoClient
        this.client = new MongoClient(uri);
        this.connection = null;
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
        let hospitals = [];

        // Insert hospitals
        const cursor = await this.client.db(databaseName).collection("hospitals").find();

        await cursor.forEach((h) => {
            delete h["_id"];
            hospitals.push(h);
        });

        return hospitals;
    }
}

const database = new Database()


module.exports = { database };