
import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express';

import { logger } from './utils/logger'

import * as organizationAPI from './routes/organization_api'
import * as locationAPI from './routes/location_api'

export const app:Application = express();

const PORT:number = 4000;

const API_BASE_URL:string = '/api';


//app.use(express.static('.'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Get server version
app.get(API_BASE_URL+'/version', (req: Request, res: Response): void => {
    //res.send('Hello world!');
    res.status(200).json({"version":"v0.6.0a"})
});


app.get(API_BASE_URL+'/organizations/:id', organizationAPI.getOrgID);
app.get(API_BASE_URL+'/organizations/', organizationAPI.getOrg);
app.post(API_BASE_URL+'/organizations/', organizationAPI.postOrg);
app.put(API_BASE_URL+'/organizations/', organizationAPI.putOrg);
app.delete(API_BASE_URL+'/organizations/:id', organizationAPI.deleteOrg);

app.get(API_BASE_URL+'/locations/:id', locationAPI.getLocID);
app.get(API_BASE_URL+'/locations/', locationAPI.getLoc);
app.post(API_BASE_URL+'/locations/', locationAPI.postLoc);
app.put(API_BASE_URL+'/locations/', locationAPI.putLoc);
app.delete(API_BASE_URL+'/locations/:id', locationAPI.deleteLoc);

app.listen(PORT, (): void => {
    logger.info('Server started on port: ' + PORT);
});


