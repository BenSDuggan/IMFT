/*
 * Make hospitals collection based off FAA registration
 */

const fs = require('fs');
const https = require('https');
const { parse } = require("csv-parse");
const spawn = require("child_process").spawn;

const { MongoClient } = require("mongodb");


const url = 'https://registry.faa.gov/database/ReleasableAircraft.zip'; // FAA URL
const dataSavePath = "../data/download"; // Where to temporarily save the data
const databaseName = "flight-test"; // MongoDB Database name
const collection = "faa"; // Database collection name
const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority"; // Connection URI

// Create a new MongoClient
const client = new MongoClient(uri);


// Remove old directory and make new one
let manageFolders = () => {
  return new Promise((resolve, reject) => {
    // Delete folder
    if (fs.existsSync(dataSavePath)) {
      fs.rmSync(dataSavePath, { recursive: true }, err => {
        if (err) {
          reject(err)
        }
      })
    }

    // Make folder
    if (!fs.existsSync(dataSavePath)){
      fs.mkdirSync(dataSavePath, { recursive: true });
    }

    resolve("finished")
  })
}

// Download the file
// From https://www.geeksforgeeks.org/how-to-download-a-file-using-node-js/
let downloadFAARegistration = () => {
  return new Promise((resolve) => { 
    console.log("Start download")
    https.get(url,(res) => {
      const path = `${__dirname}/${dataSavePath}/faa.zip`; 
    
      const filePath = fs.createWriteStream(path);
      res.pipe(filePath);
    
      filePath.on('finish',() => {
        filePath.close();
        resolve("Download Completed")
      })
    });
  });
}

// Unzip download
let unzipFAARegistration = () => {
  return new Promise((resolve) => {
    console.log("Start unzip")
    const child = spawn('unzip',
                        [`${__dirname}/${dataSavePath}/faa.zip`, 
                        "-d", 
                        `${__dirname}/${dataSavePath}`]);
    child.addListener('close', (e) => {
      resolve("Finished unzip")
    });
  });
}

// Save helicopters in FAA registration
let openFAAHelicopter = () => {
  return new Promise((resolve) => {
    console.log("Processing FAA data")
    let helicopters = [];

    // Read data
    fs.createReadStream(`${__dirname}/${dataSavePath}/MASTER.txt`)
      .pipe(parse({ 
        delimiter: ",", 
        columns: true,
        ltrim: true, 
        trim:true,
        relax_quotes: true,
        }))
      .on("data", function (row) {
        if(row["TYPE AIRCRAFT"] == '6') {
          r = {}
          for(k in Object.keys(row)) {
            key = Object.keys(row)[k]
            l = key.replace(/[\u{0080}-\u{FFFF}]/gu, "");
            r[l] = row[key];
          }

          helicopters.push(r);
        }
      })
      .on("error", function (error) {
        console.log(error.message);
      })
      .on("end", function () {
        console.log("Formatted data")
        resolve(helicopters)
      });
  })
}

// Remove collection if it exists
async function removeCollection() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("Removing collection")

    // Insert hospitals
    const remove = await client.db(databaseName).dropCollection(collection).then((results) => {
      console.log(results)
      console.log("Deleted collection");
    })
  } catch (e) {
    console.log(e);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return "Finished deleting collection"
  }
}

// Upload to MongoDB
async function uploadToDB(helicopters) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("Inserting")

    // Insert hospitals
    const insertManyResult = await client.db(databaseName).collection(collection).insertMany(helicopters);
    
    console.log(insertManyResult.acknowledged);
    console.log(insertManyResult.insertedCount);

    console.log("Uploaded results");
  } catch (e) {
    console.log(e);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return "Finished uploading"
  }
}


// Run script
manageFolders().then((result) => {
  console.log(result);
  return downloadFAARegistration()
}).then((result) => {
  console.log(result)
  return unzipFAARegistration()
}).then((result) => {
  console.log(result)
//  return removeCollection()
//}).then((result) => {
//  console.log(result);
  return openFAAHelicopter()
}).then((result) => {
  console.log(result.length)
  return uploadToDB(result)
}).then((results) => {
  console.log(results)
  return manageFolders()
}).then(() => {
  console.log("All done")
}).catch(console.error);

