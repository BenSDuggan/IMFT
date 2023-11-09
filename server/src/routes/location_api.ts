"use strict";

import { Response, Request } from "express";

import { logger } from '../utils/logger'
import { database } from '../database'
import { type Location } from '../types/structures';

const NUMBER_RESULTS:number = 2;

/**
 * Get many location. Further refine by giving dates and page number
 * @route GET /api/location
 */
export const getLoc = (req: Request, res: Response) => {
    let page:number = Number(req.query.page) ?? 0;

    database.get<Location>("lid", {}, NUMBER_RESULTS, page).then((result) => {
        res.status(200).json({"successful":true, "data":result});
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};

/**
 * Get specific organization
 * @route GET /api/locations/:id
 */
export const getLocID = (req: Request, res: Response) => {
    let id:string = req.params.id;

    database.get<Location>("lid",{"lid":id}).then((result) => {
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
 * Get specific location
 * @route POST /api/locations/
 */
export const postLoc = (req: Request, res: Response) => {
    let organization:Location = req.body;
    
    database.insert<Location>("lid", organization).then((result) => { 
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
 * Update location
 * @route PUT /api/locations/
 */
export const putLoc = (req: Request, res: Response) => {
    if(!req.body.hasOwnProperty("lid")) {
        res.status(400).json({"successful":false, "data":"An OID must be included in the body."}).end();
        return
    }
    
    database.update("lid", req.body.lid, req.body).then((result) => { 
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
 * Remove location
 * @route DELETE /api/locations/
 */
export const deleteLoc = (req: Request, res: Response) => {
    let id:string = req.params.id;

    database.delete("lid", id).then((result) => { 
        res.status(200).json({"successful":result, "data":""});
    }).catch((err) => {
        logger.error("Web: could not delete organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
};