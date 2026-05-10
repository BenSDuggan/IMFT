/*
 * Make or update collection with FAA N Number registration
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

import { logger } from '../common/logger'
import { db } from '.'
import { remove_collection } from './utils'
import { empty_make_directory, download_file, unzip_file } from '../common/utils'

const nnumber_url = 'https://registry.faa.gov/database/ReleasableAircraft.zip';
const nnumber_dataSavePath:string = "../data/downloads/nnumber"; 

const lid_url = 'https://nfdc.faa.gov/webContent/28DaySub/extra/30_Oct_2025_CSV.zip'; // FAA URL
const lid_dataSavePath:string = "../data/downloads/lid"; // Where to temporarily save the data
//const lid_columns = {"SITE_NO":"no", "SITE_TYPE_CODE":"type", "ARPT_ID":"lid", "ARPT_NAME":"name", "STATE_NAME":"state", "COUNTY_NAME":"county", "LAT_DECIMAL":"lat", "LONG_DECIMAL":"lon", "ELEV":"elevation"}
const lid_columns: Record<string, string> = {
  SITE_NO: "no",
  SITE_TYPE_CODE: "type",
  ARPT_ID: "lid",
  ARPT_NAME: "name",
  STATE_NAME: "state",
  COUNTY_NAME: "county",
  LAT_DECIMAL: "lat",
  LONG_DECIMAL: "lon",
  ELEV: "elevation",
};
interface LID_Column_Types {
  no: string
  type: string,
  lid: string,
  name: string,
  state: string,
  county: string,
  location: { type: "Point", coordinates: [ Number, Number ] },
  elevation: string
};
type LidSourceKey = keyof typeof lid_columns;

// Save helicopters in NNumber FAA registration
let open_FAA_nnumber_helicopter = async (dataSavePath:string): Promise<Record<string, string>[]> => {
  logger.verbose("open_FAA_nnumber_helicopter: Processing FAA data...");

  const helicopters: Record<string, string>[] = [];
  const masterFilePath = path.join(dataSavePath, "MASTER.txt");

  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(masterFilePath)
        .pipe(
          parse({
            delimiter: ",",
            columns: true,
            ltrim: true,
            trim: true,
            relax_quotes: true,
          })
        )
        .on("data", (row: Record<string, string>) => {
          if (row["TYPE AIRCRAFT"] === "6") {
            const cleaned: Record<string, string> = {};

            for (const key of Object.keys(row)) {
              // Clean weird unicode characters from key
              const cleanKey = key.replace(/[\u{0080}-\u{FFFF}]/gu, "");
              if (cleanKey === "") continue;
              cleaned[cleanKey] = row[key];
            }

            helicopters.push(cleaned);
          }
        })
        .on("error", (error:Error) => {
          reject(new Error(`open_FAA_nnumber_helicopter: Failed to parse FAA data: ${error.message}`));
        })
        .on("end", () => {
          logger.verbose(`open_FAA_nnumber_helicopter: Formatted ${helicopters.length} helicopter entries`);
          resolve(helicopters);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// Upload NNumber to MongoDB
const upload_nnumber_collection = async (helicopters: Record<string, any>[]): Promise<void> => {
    const collection = db.collection("faaNNumber");

    if (helicopters.length === 0) {
        logger.warn("upload_nnumber_collection: No helicopter data found to upload.");
        return;
    }

    const result = await collection.insertMany(helicopters);

    if (!result.acknowledged) {
        throw new Error("upload_nnumber_collection: Insert operation not acknowledged by MongoDB.");
    }

    logger.verbose(`upload_nnumber_collection: Inserted ${result.insertedCount} helicopter records.`);
};

// Extract LID information from downloaded data
let open_FAA_lid_location = async (dataSavePath:string): Promise<LID_Column_Types[]> => {
  logger.verbose("open_FAA_lid_location: Processing FAA data...");

  const locations: LID_Column_Types[] = [];
  const masterFilePath = path.join(dataSavePath, "APT_BASE.csv");

  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(masterFilePath)
        .pipe(
          parse({
            delimiter: ",",
            columns: true,
            ltrim: true,
            trim: true,
            relax_quotes: true,
          })
        )
        .on("data", (row: Record<string, string>) => {
          let lid_row:LID_Column_Types = {no: "", type: "", lid: "", name: "", state: "", county: "", location: { type: "Point", coordinates: [ 0, 0 ] }, elevation: ""};

          for (const key of Object.keys(row)) {
            // Clean weird unicode characters from key
            const cleanKey = key.replace(/[\u{0080}-\u{FFFF}]/gu, "");
            if (cleanKey === "") continue;
              
            if (!(cleanKey in lid_columns)) continue;

            const mappedKey = lid_columns[cleanKey as LidSourceKey];
            
            if(cleanKey == "LONG_DECIMAL")
              lid_row.location.coordinates[0] = Number(row[key])
            else if(cleanKey == "LAT_DECIMAL")
              lid_row.location.coordinates[1] = Number(row[key])
            else if (mappedKey in lid_row)
              // @ts-expect-error safe because we check key presence
              lid_row[mappedKey] = row[key];
              
          }

          locations.push(lid_row);
          
        })
        .on("error", (error:Error) => {
          reject(new Error(`open_FAA_lid_location: Failed to parse FAA data: ${error.message}`));
        })
        .on("end", () => {
          logger.verbose(`open_FAA_lid_location: Formatted ${locations.length} helicopter entries`);
          resolve(locations);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const upload_lid_collection = async (location: LID_Column_Types[]): Promise<void> => {
    const collection = db.collection("faaLID");

    if (location.length === 0) {
        logger.warn("upload_lid_collection: No helicopter data found to upload.");
        return;
    }

    const result = await collection.insertMany(location);

    if (!result.acknowledged) {
        throw new Error("upload_lid_collection: Insert operation not acknowledged by MongoDB.");
    }

    logger.verbose(`upload_lid_collection: Inserted ${result.insertedCount} helicopter records.`);
};


export let create_ffa_nnumber_collection = async () => {
    try {
        const filePath:string = path.join(nnumber_dataSavePath, "faaNNumber.zip");

        await empty_make_directory(nnumber_dataSavePath);
        await download_file(filePath, nnumber_url);
        await unzip_file(filePath);
        const helicopters: Record<string, string>[] = await open_FAA_nnumber_helicopter(nnumber_dataSavePath);
        await remove_collection("faaNNumber");
        await upload_nnumber_collection(helicopters);

        logger.info("create_ffa_nnumber_collection: uploaded new set of FAA N Number to DB")
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`create_ffa_nnumber_collection: Failed to upload N Number: ${error.message}`)
        }
        logger.error(`create_ffa_nnumber_collection: Unknown error while recreating folder`)
    }
}

// TODO: get updated url for LID
export let create_ffa_lid_collection = async () => {
    try {
        const filePath:string = path.join(lid_dataSavePath, "faaLID.zip");

        await empty_make_directory(lid_dataSavePath);
        await download_file(filePath, lid_url);
        await unzip_file(filePath);
        const location:LID_Column_Types[] = await open_FAA_lid_location(lid_dataSavePath);
        await remove_collection("faaLID");
        await upload_lid_collection(location);

        logger.info("create_ffa_lid_collection: uploaded new set of LID to DB")
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`create_ffa_lid_collection: Failed to upload N Number: ${error.message}`)
        }
        logger.error(`create_ffa_lid_collection: Unknown error while recreating folder`)
    }
}
