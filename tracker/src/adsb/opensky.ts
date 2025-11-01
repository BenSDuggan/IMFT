// Get data from open sky network

import https from "https";
import querystring from "querystring";

import { config } from '../common/config'
import { logger } from "../common/logger";
import { epoch_s } from "../common/utils";
import { ADSB_State, Aircraft_State } from "../types/structures";

const update_access_time:number = 25 * 60; // Get new access token every 25 minutes

let access_token:string = "";
let access_token_expires_time:number = 0;

/**
 * Represents a single aircraft state vector from the OpenSky API.
 * Reference: https://opensky-network.org/apidoc/rest.html#response
 */
export interface OpenSky_StateVector {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category?: number;
}

/**
 * Represents the full OpenSky API /states/all response.
 */
interface OpenSky_Response {
  time: number;
  states: Array<
    [
      string,             // icao24
      string | null,      // callsign
      string,             // origin_country
      number | null,      // time_position
      number,             // last_contact
      number | null,      // longitude
      number | null,      // latitude
      number | null,      // baro_altitude
      boolean,            // on_ground
      number | null,      // velocity
      number | null,      // true_track
      number | null,      // vertical_rate
      number[] | null,    // sensors
      number | null,      // geo_altitude
      string | null,      // squawk
      boolean,            // spi
      number,             // position_source
      number?             // category (optional)
    ]
  >;
}

/*
 * Response shape for Keycloak token endpoint
 */
interface OpenSky_TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
}


/*
 * Converts a tuple-based OpenSky state array into a structured object.
 */
let map_state_vector = (state: OpenSky_Response["states"][number]): OpenSky_StateVector => {
  const [
    icao24,
    callsign,
    origin_country,
    time_position,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    sensors,
    geo_altitude,
    squawk,
    spi,
    position_source,
    category
  ] = state;

  return {
    icao24,
    callsign,
    origin_country,
    time_position,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    sensors,
    geo_altitude,
    squawk,
    spi,
    position_source,
    category,
  };
}

/*
 * Converts OpenSky State to Generic ADSB State
 */
let map_generic_state = (state: OpenSky_StateVector): Aircraft_State => {
    return {
        "icao24":state.icao24, // ADS-B ICAO24
        "callsign":state.callsign, // Callsign
        "squawk":state.squawk, // Squawk
        "emergency":null, // Emergency
        "spi": state.spi, // SPI (special purpose indicator)
        "time":state.time_position, // Time position was sent
        "lon":state.longitude, // Longitude
        "lat":state.latitude, // Latitude
        "alt":state.geo_altitude ?? state.baro_altitude, // Altitude (geometric preferred but may be baro)
        "heading":state.true_track, // Heading, 0 is north
        "roll":null, // Roll amount
        "velocity":state.velocity, // Velocity in MPH (ground > true > indicator)
        "vertical_rate":state.vertical_rate, // Vertical rate in FPS
        "on_ground":state.on_ground, // On ground or not
        "category":state.category // Aircraft type
    }
}


/*
 * Fetch OpenSky auth token using built-in HTTPS.
 */
let fetch_opensky_auth_token =  async (): Promise<boolean> => {
  const postData = querystring.stringify({
    grant_type: "client_credentials",
    client_id: config.adsb.opensky.client_id,
    client_secret: config.adsb.opensky.client_secret,
  });

  const options: https.RequestOptions = {
    method: "POST",
    hostname: "auth.opensky-network.org",
    path: "/auth/realms/opensky-network/protocol/openid-connect/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json:OpenSky_TokenResponse = JSON.parse(data);
            if (json.access_token) {
                access_token = json.access_token;
                access_token_expires_time = json.expires_in + epoch_s() -5;

                resolve(true);
            } else {
              reject(new Error("fetch_opensky_auth_token: Token response missing access_token"));
            }
          } catch {
            reject(new Error("fetch_opensky_auth_token: Failed to parse token response"));
          }
        } else {
          reject(
            new Error(`fetch_opensky_auth_token: Token request failed: ${res.statusCode} ${res.statusMessage}`)
          );
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });

}

/*
 * Fetch OpenSky data using built-in HTTPS.
 */
let fetch_opensky_data = async ():Promise<OpenSky_Response> => {
  // Fetch new auth token if required
    if(access_token == "" || access_token_expires_time > epoch_s())
        await fetch_opensky_auth_token();

  const options: https.RequestOptions = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
      "User-Agent": "NodeOpenSkyClient/1.0",
    },
  };

  let url = "https://opensky-network.org/api/states/all?";

  // Add coordinate constraints
  url += `lamin=${config.grid.lat_min}&lomin=${config.grid.lon_min}&lamax=${config.grid.lat_max}&lomax=${config.grid.lon_max}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, options, (res) => {
        let raw = "";

        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed:OpenSky_Response = JSON.parse(raw);
              resolve(parsed);
            } catch {
              reject(new Error("fetch_opensky_data: Failed to parse JSON"));
            }
          } else {
            reject(new Error(`fetch_opensky_data: Request failed: ${res.statusCode}`));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

// Get opensky data and return in our data format
export const get_opensky_data = async ():Promise<ADSB_State> => {
    let state:ADSB_State = {
        time:0,
        states:[],
        source:"opensky"
    }

    try {
        const response = await fetch_opensky_data();

        // Convert to structured objects
        const mapped = response.states.map(map_state_vector);

        state.time = response.time;
        state.states = mapped.map(map_generic_state);
    } catch (err) {
        logger.error("get_opensky_data: Error fetching data:", err);
    }

    return state;
}

