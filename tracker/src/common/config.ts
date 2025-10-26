
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
    db: database_config_type
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
