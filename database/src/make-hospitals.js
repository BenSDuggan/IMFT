/*
 * Make hospitals collection using the JSON element
 */

const fs = require('fs');
const { MongoClient } = require("mongodb");

const databaseName = "flight-test"

let rawdata = fs.readFileSync('../data/hospitals.json');
const hospitals = JSON.parse(rawdata);

// Connection URI
const uri =
  "mongodb://localhost:27017/?maxPoolSize=20&w=majority";
// Create a new MongoClient
const client = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Insert hospitals
    const insertManyResult = await client.db(databaseName).collection("hospitals").insertMany(hospitals);
    
    console.log(insertManyResult.acknowledged);
    console.log(insertManyResult.insertedCount);

    console.log("Ran correctly");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
