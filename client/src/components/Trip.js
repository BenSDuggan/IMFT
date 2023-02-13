
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FlightSelected from './FlightSelected'
import Map from './Map';


let create_bbox = (path) => {
    let [min_lat, min_lon, max_lat, max_lon] = [85, 180, -85, -180];

    if(path.length === 0)
        return [[37, -88.028], [41.762, -84.809]];
    
    for(let i=0; i<path.length; i++) {
        min_lat = path[i][0] < min_lat ? path[i][0] : min_lat;
        min_lon = path[i][0] < min_lon ? path[i][1] : min_lon;
        max_lat = path[i][0] > max_lat ? path[i][0] : max_lat;
        max_lon = path[i][0] > max_lon ? path[i][1] : max_lon;
    }

    return [[min_lat, min_lon], [max_lat, max_lon]]
}

function Trip() {
    let { tid } = useParams();

    const [trip, setTrip] = useState([]);

    useEffect(() => {
        let ignore = false;

        async function getTrip() {
            const res = await fetch("/api/trip/"+tid)
            .catch((error) => console.error(error));

            if (!ignore) {
                res.json().then((data) => {
                  setTrip(data);
                  console.log(data)
                })
                .catch((error) => console.error(error));
            }
        }
        getTrip();

        return () => {ignore = true;}
      }, [tid]);

    return (
        <>
            <div id="main-container_live">
                {trip.length === 1?
                <Container className="main" id="main_live" fluid="true">
                    <Row className="fill_grid">
                    <Col sm={5} className="fill_grid" id="sidebar" >
                        <FlightSelected 
                            flight={null} 
                            trip={trip[0]} >
                        </FlightSelected>
                    </Col>
                    <Col sm={7} className="fill_grid">
                    <Map 
                        trips={trip} 
                        bbox={create_bbox(trip[0].path)}
                        selectedSidebar={{"tab":"selected-flight", "id":trip[0].aircraft.aid}} >    
                    </Map>
                    </Col>
                    </Row>
                </Container>:
                <></>}
            </div>
        </>
    )
}

export default Trip;