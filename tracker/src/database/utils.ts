/*
 * Collection of MongoDB utility tools
 */

import { logger } from '../common/logger'
import { db } from '../database'

// Remove collection if it exists
export const remove_collection = async (collection_name:string): Promise<void> => {
  try {
    // Check if the collection exists first
    const collections = await db.listCollections({ name: collection_name }).toArray();

    if (collections.length > 0) {
      await db.dropCollection(collection_name);
      logger.verbose(`remove_collection: Deleted existing collection 'faaNNumber'`);
    } else {
      logger.verbose(`remove_collection: Collection 'faaNNumber' does not exist — skipping drop.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`remove_collection: removeCollection: ${error.message}`);
    } else {
      logger.error("remove_collection: removeCollection: Unknown error occurred");
    }
  }
};

// Check if collection exists
export const collection_exists_huh = async (collection_name:string): Promise<boolean> => {
  try {
    // Check if the collection exists first
    const collections = await db.listCollections({ name: collection_name }).toArray();

    if (collections.length > 0) {
      return true;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`collection_exists_huh: cannot check if n number exists: ${error.message}`);
    } else {
      logger.error("collection_exists_huh: cannot check if n number exists. Unknown error occurred");
    }
  }
  return false;
};