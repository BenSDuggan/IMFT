"use strict";

import { Response, Request, NextFunction } from "express";

import { logger } from '../logger'
import { database } from '../database'
import { type Organization } from '../types/structures';


/**
 * Get many organizations. Further refine by giving dates and page number
 * @route GET /api/organizations
 */
export const getOrganization = (req: Request, res: Response) => {
    database.get("oid", {}).then((result) => { 
        if(Array.isArray(result)) 
            res.status(200).json({"successful":true, "data":result});
        else 
            res.status(400).json({"successful":true, "data":result}).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};
