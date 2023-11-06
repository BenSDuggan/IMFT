import { logger } from '../src/logger'
import { Flight, Organization, StateShort } from '../src/types/structures'
import { database } from '../src/database'

let ss:StateShort = {
    "time":1, // Time position was sent
    "lon":2, // Longitude
    "lat":3, // Latitude
    "baro_altitude":4, // Barometric altitude
    "geo_altitude":5, // Altitude
    "heading":6, // Heading, 0 is north
    "velocity":7, // Velocity in MPH
    "vertical_rate":8, // Vertical rate in FPS
    "on_ground":true, // On ground or not
}

let o1:Organization = {
    "oid":"fghijklmnop",
    "display_name":"IUH",
    "description": "Test 1",
    "locations":[],
    "aircraft":["abc","123"]
}

let o2:Organization = {
    "oid":"pp",
    "display_name":"Parkview",
    "description": "Test 2",
    "locations":["FW1"],
    "aircraft":["908abc","wer"]
}

database.connect().then(() => {
    logger.info("Connected to the database");
})

//database.insert_organization([o1, o2]).then((result) => { console.log(result) })

//database.insert("oid", [o1,o2]).then((result) => { console.log(result) })

//database.update_organization("pp", {display_name:"Parkview Health", locations:["hi"]}).then((result) => { console.log(result) })

//database.update("oid", "pp", {display_name:"Parkview Health", locations:["hi"]}).then((result) => { console.log(result) })

//database.delete_organization(["fghijklmnop", "pp"]).then((result) => console.log(result));

database.get("oid", {}).then((result) => { console.log(result); })

//database.delete<Organization>("oid", ["pp", "fghijklmnop"]);

//database.delete_organization(["pp", "fghijklmnop"]);

//database.delete_one("oid","pp");

//database.delete_many("oid", ["pp", "fghijklmnop"]);

//database.delete("oid", []).then((r1) => console.log(r1)).catch((err) => logger.error(err.message))