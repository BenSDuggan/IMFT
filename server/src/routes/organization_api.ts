"use strict";

import { Response, Request } from "express";

import { logger } from '../logger'
import { database } from '../database'
import { type Organization } from '../types/structures';


/**
 * Get many organizations. Further refine by giving dates and page number
 * @route GET /api/organizations
 */
export const getOrg = (req: Request, res: Response) => {
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

/**
 * Get specific organization
 * @route GET /api/organizations/:id
 */
export const getOrgID = (req: Request, res: Response) => {
    let oid:string = req.params.oid;
    database.get("oid",{"oid":oid}).then((result) => {
        if(Array.isArray(result) && result.length > 0) 
            res.status(200).json({"successful":true, "data":result});
        else if(Array.isArray(result))
            res.status(404).json({"successful":true, "data":result}).end();
        else 
            res.status(400).json({"successful":true, "data":result}).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};

/**
 * Get specific organization
 * @route POST /api/organizations/
 */
export const postOrg = (req: Request, res: Response) => {
    let organization:Organization = req.body;
    
    database.insert<Organization>("oid", organization).then((result) => { 
        if(result) 
            res.status(200).json({"successful":result, "data":""});
        else 
            res.status(400).json({"successful":result, "data":""}).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};


/**
 * Update organization
 * @route PUT /api/organizations/
 */
export const putOrg = (req: Request, res: Response) => {
    if(!req.body.hasOwnProperty("oid")) {
        res.status(400).send("An OID must be included in the body.").end();
        return
    }
    
    database.update("oid", req.body.oid, req.body).then((result) => { 
        if(result) 
            res.status(200).json({"successful":result, "data":""})
        else 
            res.status(400).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};

/**
 * Remove organization
 * @route DELETE /api/organizations/
 */
export const deleteOrg = (req: Request, res: Response) => {
    let oid:string = req.params.oid;
    database.delete("oid", oid).then((result) => { 
        res.status(200).json({"successful":result, "data":""});
    }).catch((err) => {
        logger.error("Web: could not delete organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};