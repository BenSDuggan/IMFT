
import { readFileSync, existsSync } from 'fs'

import { logger } from './logger'

const SETTINGS_FILE_PATH = "../data/config.json";


interface database_config_type {
    host:string,
    port:string,
    user:string,
    pass:string,
    name:string
}

interface config_type {
    env: string,
    port: string,
    db: database_config_type,
    web: {
        port: number
    },
    grid: {
        lat_min: number,
        lat_max: number,
        lon_min: number,
        lon_max: number
    },
    center_point: {
        lat: number,
        lon: number
    }
    adsb: {
        opensky?: {
            client_id: string,
            client_secret: string,
            quota: number
        },
        adsb_exchange?: {
            aki_key: string,
            quota: number
        }, 
        historic?: {
            path: string
        }
    }
}

export let config:config_type = {
    "env":"dev",
    "port":"4010",
    "db": {
        "host":"localhost",
        "port":"27017",
        "user":"",
        "pass":"",
        "name":"mft"
    },
    "web": {
        "port": 4010
    },
    "grid": {
        "lat_min": 36.558830,
        "lat_max": 39.148272,
        "lon_min": -89.570680,
        "lon_max": -81.965085
    },
    "center_point": {
        "lat": 0,
        "lon": 0
    },
    "adsb": {
    }
}


let load_config_from_file = () => {
    const config_file = JSON.parse(readFileSync(SETTINGS_FILE_PATH, 'utf8'));  

    if(config_file.env) {
        config.env = config_file.env;
    }

    if(config_file.db) {
        if(config_file.db.name) {
            config.db.name = config_file.db.name;
        }
        if(config_file.db.host) {
            config.db.host = config_file.db.host;
        }
        if(config_file.db.user) {
            config.db.user = config_file.db.user;
        }
        if(config_file.db.pass) {
            config.db.pass = config_file.db.pass;
        }
    }

    if(config_file.web) {
        if(config_file.web.port) {
            config.web.port = config_file.web.port;
        }
    }

    if(config_file.grid) {
        if(config_file.grid.lat_min) {
            config.grid.lat_min = config_file.grid.lat_min;
        }
        if(config_file.grid.lat_max) {
            config.grid.lat_max = config_file.grid.lat_max;
        }
        if(config_file.grid.lon_min) {
            config.grid.lon_min = config_file.grid.lon_min;
        }
        if(config_file.grid.pass) {
            config.grid.lon_max = config_file.grid.lon_max;
        }
    }

    if(config_file.center_point) {
        if(config_file.center_point.lat) {
            config.center_point.lat = config_file.center_point.lat;
        }
        if(config_file.center_point.lon) {
            config.center_point.lon = config_file.center_point.lon;
        }
    }

    if(config_file.adsb && config_file.adsb.opensky) {
        config.adsb["opensky"] = {
            "client_id": "",
            "client_secret": "",
            "quota": 4000
        };

        if(config_file.adsb.opensky.client_id) {
            config.adsb.opensky.client_id = config_file.adsb.opensky.client_id;
        }
        if(config_file.adsb.opensky.client_secret) {
            config.adsb.opensky.client_secret = config_file.adsb.opensky.client_secret;
        }
        if(config_file.adsb.opensky.quota) {
            config.adsb.opensky.quota = config_file.adsb.opensky.quota;
        }
    }

    if(config_file.adsb && config_file.adsb.adsb_exchange) {
        config.adsb["adsb_exchange"] = {
            "aki_key": "",
            "quota": 0
        };

        if(config_file.adsb.adsb_exchange.aki_key) {
            config.adsb.adsb_exchange.aki_key = config_file.adsb.adsb_exchange.aki_key;
        }
        if(config_file.adsb.adsb_exchange.quota) {
            config.adsb.adsb_exchange.quota = config_file.adsb.adsb_exchange.quota;;
        }
    }

    if (config_file.adsb?.historic?.path) {
        config.adsb["historic"] = {"path":config_file.adsb.historic.path}
    }
}

let update_config_with_env_var = () => {
    if(process.env.FA_PROD && process.env.FA_PROD == "true") {
        config.env = "env";
    }

    if(process.env.DB_HOST) {
        config.db.host = process.env.DB_HOST;
    }
    if(process.env.DB_USER) {
        config.db.user = process.env.DB_USER;
    }
    if(process.env.DB_PASS) {
        config.db.pass = process.env.DB_PASS;
    }

    // Warn that using default config in production
    if(config.env && process.env.DB_USER) {
        logger.error('utils.config: Could not find database config in environment variables. Default settings being used which is unsecure.')
    }
}

if (existsSync(SETTINGS_FILE_PATH)) {
    logger.info("config: loading configuration from `config.json`")
    load_config_from_file();
}
else {
    logger.info("config: loading configuration from environment variables")
    update_config_with_env_var();
}
