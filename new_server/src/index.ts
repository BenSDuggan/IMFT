

import {  } from './logger'
import { Flight, StateShort } from './structures'
import {  } from './database'
import './web'

console.log("swag")

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

console.log(ss)
