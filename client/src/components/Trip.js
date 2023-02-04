
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import Map from './Map';
import Table from 'react-bootstrap/Table';

let create_bbox = (path) => {
    console.log(path)
    let [min_lat, min_lon, max_lat, max_lon] = [85, 180, -85, -180];

    if(path.length == 0)
        return [[37, -88.028], [41.762, -84.809]];
    
    for(let i=0; i<path.length; i++) {
        min_lat = path[i][0] < min_lat ? path[i][0] : min_lat;
        min_lon = path[i][0] < min_lon ? path[i][1] : min_lon;
        max_lat = path[i][0] > max_lat ? path[i][0] : max_lat;
        max_lon = path[i][0] > max_lon ? path[i][1] : max_lon;
    }

    return [[min_lat, min_lon], [max_lat, max_lon]]
}

function Trip(props) {
    let { tid } = useParams();

    const [trip, setTrip] = useState([]);
    
    let display_date = (date) => new Date(date).toLocaleString();   

    useEffect(() => {
        let ignore = false;
        
        async function getVersion() {
            const res = await fetch("/api/version")
            .catch((error) => console.error(error));

            if (!ignore) {
              res.json().then((data) => {
                console.log(data)
              })
              .catch((error) => console.error(error));
              
            }
        }

        async function getTrip() {
            const res = await fetch("/api/trip/"+tid)
            .catch((error) => console.error(error));

            if (!ignore) {
                res.json().then((data) => {
                  setTrip(data);
                })
                .catch((error) => console.error(error));
            }
        }
        
        getVersion();
        getTrip();

        return () => {ignore = true;}
      }, []);

    return (
        <>
            <h2>Trip</h2>

            <div id="main-container_live">
                {trip.length == 1?
                <Map 
                    trips={trip}
                    bbox={create_bbox(trip[0].path)}>
                </Map>:<></>}
            </div>
        </>
    )
}

export default Trip;