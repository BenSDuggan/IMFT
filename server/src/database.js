/*
 * Code to interact with the database
 */

// TODO: Get trips for a given date range and by aircraft and destination / arrival

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
    * Example: database.save_trip({"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":1669923349,"lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":1669923944,"lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[]}).then((result) => {console.log(result)})
    */
    async save_trip(trip) {
        return false;
        const result = await this.client.db(databaseName).collection("trips").insertOne(trip);

        if(result.acknowledged)
            logger.debug("Database: Inserted new trip with tid: " + trip.tid)
        else
            logger.warn("Database: Could not insert trip with tid: " + trip.tid)

        return result.acknowledged
    }

    /* Get the requested trip using the query
    *
    * term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
    *
    * Returns: JSON object with all the matching trips
    * 
    * Example: `database.get_faa_registration({"MODE S CODE HEX":"A16CE7"}).then((results) => console.log(results))`
    */
    async get_trip(term) {
        let answer = [];

        const cursor = await this.client.db(databaseName).collection("trips").find(term);
        await cursor.forEach((r) => {
            answer.push(r);
        });

        return answer;
    }

    /* Get the index for the given field
    *
    * field (String): the field to get the index of
    * query (JSON): further subsetting options
    *
    * Returns: Array with the aids
    */
    async get_trip_index(field, query) {
        const index = await this.client.db(databaseName).collection("trips").distinct(field, query)

        return index;
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