
import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express';

import { logger } from './logger'
import { database } from './database'
import { Organization } from './types/structures';

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
    database.get_organizations({"oid":oid}).then((result) => {
        if(Array.isArray(result) && result.length > 0) 
            res.status(200).json(result)
        else if(Array.isArray(result))
            res.status(404).end();
        else 
            res.status(400).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err);
        res.status(500).end();
    });
});

// Get many organizations. Further refine by giving dates and page number
app.get(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
    database.get_organizations({}).then((result) => { 
        if(Array.isArray(result)) 
            res.status(200).json(result)
        else 
            res.status(400).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err);
        res.status(500).end();
    });
});

// Create organization
app.post(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
    let organization:Organization = req.body;
    
    database.insert_organization(organization).then((result) => { 
        if(result) 
            res.status(200).json(result)
        else 
            res.status(400).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err);
        res.status(500).end();
    });
});

// Update organization
app.put(API_BASE_URL+'/organizations/', (req: Request, res: Response): void => {
    if(!req.body.hasOwnProperty("oid")) {
        res.status(400).send("An OID must be included in the body.").end();
        return
    }
    
    database.update_organization(req.body.oid, req.body).then((result) => { 
        if(result) 
            res.status(200).json(result)
        else 
            res.status(400).end();
    }).catch((err) => {
        logger.error("Web: could not fetch organization from database. " + err);
        res.status(500).end();
    });
});

// Remove organization
app.delete(API_BASE_URL+'/organizations/:oid', (req: Request, res: Response): void => {
    let oid:string = req.params.oid;
    database.delete_organization(oid).then((result) => { 
        res.status(200).json(result);
    }).catch((err) => {
        logger.error("Web: could not delete organization from database. " + err);
        res.status(500).end();
    });
});

app.listen(PORT, (): void => {
    logger.info('Server started on port: ' + PORT);
});

//export { app }

