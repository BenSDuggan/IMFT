// Get data from ADSB Exchange

import https from "https";
import querystring from "querystring";

import { config } from '../common/config'
import { logger } from "../common/logger";
import { epoch } from "../common/utils";
import { io } from "../web"
import { adsb_put, adsb_raw_put } from '../database/adsb'

import { ADSB_State, Aircraft_State, Category } from "../types/structures";


/**
 * Represents a single aircraft state vector from the ADSB Exchange API (based off enterprise endpoint, which we dont get all off)
 * Reference: https://gateway.adsbexchange.com/api/aircraft/v2/docs/index.html?url=/api/aircraft/v2/docs/openapi.json#tag/Live-Positional-Data/operation/GetApiAircraftV2TotalAircraft
 */
export interface ADSB_Exchange_StateVector {
    hex: string; // The ICAO 24-bit address (hex) of the aircraft.
    type: string | null; // The type of message (e.g., adsb_icao, tisb_icao, etc.).
    flight : string | null; // The flight number or callsign.
    r: string | null; // Registration or tail number.
    t: string | null; // Aircraft type (e.g., B38M for Boeing 737 MAX 8).
    alt_baro: number | null; // Barometric altitude in feet.
    alt_geom: number | null; // Geometric altitude in feet.
    gs: number | null; // Ground speed in knots.
    track: number | null; // Aircraft track over the ground in degrees.
    baro_rate: number | null; // Barometric vertical rate (climb or descent) in feet per minute.
    geom_rate: number | null; // Geometric vertical rate (climb or descent) in feet per minute.
    squawk: string | null; // Transponder squawk code.
    emergency: string | null; // Emergency code (if applicable).
    category: string | null; // Aircraft category based on size and weight.
    lat: number | null; // Latitude of the aircraft.
    lon: number | null; // Longitude of the aircraft.
    nic: number | null; // Navigation Integrity Category.
    rc: number | null; // Containment Radius of Accuracy in meters.
    seen_pos: number | null; // Time since the last positional update in seconds.
    nic_baro: number | null; // Barometric NIC (Navigation Integrity Category).
    nac_p: number | null; // Navigation Accuracy Category for Position.
    nac_v: number | null; // Navigation Accuracy Category for Velocity.
    sil: number | null; // Source Integrity Level
    sil_type: string | null; // Source Integrity Level type (e.g., per hour or per sample).
    gva: number | null; // Geometric Vertical Accuracy.
    sda: number | null; // System Design Assurance.
    alert: number | null; // Alert status (whether the transponder is indicating an alert).
    spi: number | null; // Special Position Identification (SPI) status.
    mlat: Array<string> | null; // List of fields derived from MLAT data (e.g., "lat", "lon", "nic", "rc").
    tisb: Array<string> | null; // List of fields derived from TIS-B data (e.g., "gs", "lat", "lon", "nic", "rc", "nac_p", "sil", "sil_type").
    messages: number | null; // The number of messages received from the aircraft.
    seen: number | null; // Time since the last message was received, in seconds.
    rssi: number | null; // Signal strength in dBFS.
}

/**
 * Represents the full ADSB Exchange API /states/all response.
 */
interface ADSB_Exchange_Response {
    ac: Array<ADSB_Exchange_StateVector>, // List of aircraft with all available information.
    msg: string, // Message indicating the status of the request overall.
    now: number, // Unix timestamp of the current UTC time on the server (ms).
    total: number, // The number of aircraft in the response
    ctime: number, // Unix timestamp (ms) of when the underlying data was last updated.
    ptime: number  // Time taken on server to process the request (ms).
}

/*
 * Converts ADSB Exchange category to generic category
 */
let map_generic_category = (category: string|null): Category => {
    switch (category) {
      case "A0":
        return "No ADS-B Emitter Category Information";
      case "A1":
        return "Light";
      case "A2":
        return "Small";
      case "A3":
        return "Large";
      case "A4":
        return "High Vortex Large";
      case "A5":
        return "Heavy";
      case "A6":
        return "High Performance";
      case "A7":
        return "Rotorcraft"
      case "B0":
        return "No ADS-B Emitter Category Information";
      case "B1":
        return "Glider, sailplane";
      case "B2":
        return "Lighter-than-air"
      case "B3":
        return "Parachutist / Skydiver";
      case "B4":
        return "Ultralight, hang-glider, paraglider";
      case "B5":
        return  "Reserved";
      case "B6":
        return "Unmanned Aerial Vehicle";
      case "B7":
        return "Space, Trans-atmospheric vehicle";
      case "C0":
        return "No ADS-B Emitter Category Information";
      case "C1":
        return "Surface Vehicle - Emergency Vehicle";
      case "C2":
        return "Surface Vehicle - Service Vehicle";
      case "C3":
        return "Point Obstacle";
      case "C4":
        return "Cluster Obstacle";
      case "C5":
        return "Line Obstacle";
      case "C6":
        return "Reserved";
      case "C7":
        return "Reserved";
      default:
        return null
    }
}

/*
 * Converts OpenSky State to Generic ADSB State
 */
let map_generic_state = (state: ADSB_Exchange_StateVector): Aircraft_State => {
    return {
        "icao24":state.hex, // ADS-B ICAO24
        "callsign":state.flight == null ? null : state.flight.trim(), // Callsign
        "squawk":state.squawk, // Squawk
        "emergency":state.emergency ?? "", // Emergency
        "spi": state.spi ?? -1, // SPI (special purpose indicator)
        "time":state.seen_pos == null ? null : epoch() - (state.seen_pos*1000), // Time position was sent
        "lon":state.lon, // Longitude
        "lat":state.lat, // Latitude
        "alt":state.alt_geom ?? state.alt_baro, // Altitude (geometric preferred but may be baro)
        "heading":state.track, // Heading, 0 is north
        "roll":null, // Roll amount
        "velocity":state.gs, // Velocity in MPH (ground > true > indicator)
        "vertical_rate":state.geom_rate ?? state.baro_rate, // Vertical rate in FPS
        "on_ground":null, // On ground or not
        "category":map_generic_category(state.category) // Aircraft type
    }
}

/*
 * Fetch ADSB Exchange data using built-in HTTPS.
 */
export let fetch_adsb_exchange_data = async ():Promise<ADSB_Exchange_Response> => {
    // Add coordinate constraints
    let url = `/v2/lat/${config.center_point.lat}/lon/${config.center_point.lon}/dist/10`;
    
    const options: https.RequestOptions = {
        method: "GET",
        hostname: "adsbexchange-com1.p.rapidapi.com",
        path: url,
        headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "adsbexchange-com1.p.rapidapi.com",
            "x-rapidapi-key": config.adsb.adsb_exchange?.aki_key,
        },
    };


  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        let raw = "";

        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed:ADSB_Exchange_Response = JSON.parse(raw);
              resolve(parsed);
            } catch {
              reject(new Error("fetch_adsb_data: Failed to parse JSON"));
            }
          } else {
            reject(new Error(`fetch_adsb_data: Request failed: ${res.statusCode}`));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}


// Get adsb_exchange data and return in our data format
export const get_adsb_exchange_data = async ():Promise<ADSB_State> => {
    let state:ADSB_State = {
        time:0,
        states:[],
        source:"adsb_exchange"
    }

    try {
        const response = await fetch_adsb_exchange_data();

        state.time = response.ctime;
        state.states = response.ac.map(map_generic_state);

        // Save to DB
        await adsb_raw_put({"time":state.time, "source":state.source, "states": response.ac});
        await adsb_put(state);
        io.emit("adsb-new", state);

        logger.info(`adsb-exchange: Retrieved and saved ${state.states.length} ADS-B records.`);
    } catch (err) {
        logger.error("get_opensky_data: Error fetching data:", err);
    }

    return state;
}

