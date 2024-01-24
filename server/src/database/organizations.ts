
import { 
    MongoClient, 
    type InsertOneResult, 
    type InsertManyResult, 
    type UpdateResult,
    type DeleteResult, 
    type Filter,
    type WithId,
    Document
} from "mongodb"

import { logger } from "../utils/logger"
import { Organization } from '../types/structures'


/* Search organization
*
* term (JSON): What values should be used to search for. (eg {"N-NUMBER":"N191LL"} or {"MODE S CODE HEX":"A16CE7"})
* num_results (number): How many results to return
* page (number): What page to return
*
* Returns: Promise to result
*/
export const get_organization = async (terms:{}, num_results:number=10, page:number=0):Promise<WithId<Organization>[]> => {
    const cursor = await this.client
    .db(DATABASE_NAME)
    .collection<Organization>("organization")
    .find(terms)
    .skip(num_results*page)
    .limit(num_results);

    return await cursor.toArray();
}