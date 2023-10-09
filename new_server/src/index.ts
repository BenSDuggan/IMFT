

import { logger } from './logger'
import { Flight, Organization, StateShort } from './types/structures'
import { Database } from './database'
import './web'

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

const database:Database = new Database();

database.connect().then(() => {
    logger.info("Connected to the database");
})

//database.insert_organization([o1,o2]).then((result) => { console.log(result) })

//database.update_organization("pp", {display_name:"Parkview Health", locations:["hi"]}).then((result) => { console.log(result) })


database.get_organization({}).then((result) => { console.log(result); })
