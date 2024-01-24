"use strict";

import { Response, Request } from "express";

import { logger } from '../utils/logger'
import { get_organization } from '../database/organizations'
import { database } from '../database'
import { type Organization } from '../types/structures';

const NUMBER_RESULTS:number = 10;

/**
 * Get many organizations. Further refine by giving dates and page number
 * @route GET /api/organizations
 */
export const getOrg = (req: Request, res: Response) => {
    let page:number = Number(req.query.page) ?? 0;

    database.get<Organization>("oid", {}, NUMBER_RESULTS, page).then((result) => {
        res.status(200).json({"successful":true, "data":result});
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
    let id:string = req.params.id;

    database.get<Organization>("oid",{"oid":id}).then((result) => {
        if(result.length > 0) 
            res.status(200).json({"successful":true, "data":result});
        else
            res.status(404).json({"successful":true, "data":result}).end();
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
        res.status(400).json({"successful":false, "data":"An OID must be included in the body."}).end();
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
    let id:string = req.params.id;
    database.delete("oid", id).then((result) => { 
        res.status(200).json({"successful":result, "data":""});
    }).catch((err) => {
        logger.error("Web: could not delete organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};