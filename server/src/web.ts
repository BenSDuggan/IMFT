
import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express';

import { logger } from './logger'
import { database } from './database'
import { type Organization } from './types/structures';

export const app:Application = express();

const PORT:number = 3001;

const API_BASE_URL:string = '/api';


//app.use(express.static('.'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Get server version
app.get(API_BASE_URL+'/version', (req: Request, res: Response): void => {
    //res.send('Hello world!');
    res.status(200).json({"version":"v0.6.0a"})
});

/*************************
 ***   Organizations   ***
 ************************/

 // Get specific organization
app.get(API_BASE_URL+'/organizations/:oid', (req: Request, res: Response): void => {
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
});

// Get many organizations. Further refine by giving dates and page number
app.get(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
    database.get("oid", {}).then((result) => { 
        if(Array.isArray(result)) 
            res.status(200).json({"successful":true, "data":result});
        else 
            res.status(400).json({"successful":true, "data":result}).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
});

// Create organization
app.post(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
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
});

// Update organization
app.put(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
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
});

// Remove organization
app.delete(API_BASE_URL+'/organizations/:oid', (req: Request, res: Response): void => {
    let oid:string = req.params.oid;
    database.delete("oid", oid).then((result) => { 
        res.status(200).json({"successful":result, "data":""});
    }).catch((err) => {
        logger.error("Web: could not delete organization from database. " + err.message);
        res.status(500).json({"successful":false, "data":err.message}).end();
    });
});

app.listen(PORT, (): void => {
    logger.info('Server started on port: ' + PORT);
});

//export { app }

