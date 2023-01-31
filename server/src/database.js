/*
 * Code to interact with the database
 */

// TODO: Load database params from config
// TODO: Save trips to database
// TODO: Get trips for a given date range and by aircraft and destination / arrival
// TODO: Create table for dynamic data on the fly during development mode

const { MongoClient } = require("mongodb");

const { logger } = require('./logger.js')
const utils = require('./utils.js');


const databaseName = utils.config.database.name ?? "flight-test";

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
        await this.connection.close();
    }

    /* Get all the hospitals in the system. Safe == true
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

    /* Find nearby FAA airports from given coordinates and max distance. Safe == yes?
    *
    * latitude (Number): Latitude to search
    * longitude (Number): Longitude to search
    * max_distance (Number): maximum distance to search
    *
    * Returns: Array of JSON object each of which is an airport within the searched distance
    * 
    * Example: `database.find_nearby_faa_lid(39.77792, -86.18018, 300).then((results) => console.log(results))`
    */
    async find_nearby_faa_lid(latitude, longitude, max_distance) {
        let answer = [];
        let term = 
            { location: 
                { $near: 
                    { 
                        $geometry: { 
                            type: "Point", 
                            coordinates: [Number(longitude), Number(latitude)] 
                        },
                        $maxDistance: Number(max_distance) 
                    } 
                } 
            }

        const cursor = await this.client.db(databaseName).collection("faaLID").find(term);
        
        await cursor.forEach((r) => {
            answer.push(r);
        });

        return answer;
    }

    /* Saves the given trip to the trips collection
    *
    * trips (JSON): the trip to add to the database
    *
    * Returns: true if added successfully and false otherwise
    * 
    * Example: 
    */
    async save_trip(trip) {
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
    //database.get_faa_registration({"MODE S CODE HEX":"A16CE7"}).then((results) => console.log(results))
  })

module.exports = { database };