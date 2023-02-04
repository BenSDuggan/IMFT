
import React, {useEffect, useState} from "react";

import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import Table from 'react-bootstrap/Table';

function Trips(props) {
    const [trips, setTrips] = useState([]);
    const rar = [{"tid":"82fee102-c905-4bf1-93c5-13f38adbe6be","aid":"a16ce7","status":"grounded","departure":{"lid":"I80","type":"faaLID","display_name":"NOBLESVILLE","time":"2022-12-01T19:35:49.000Z","lat":39.9414,"lon":-85.8842,"distance":31899.69189402237},"arrival":{"lid":"riley","type":"hospital","display_name":"IUH Riley","time":"2022-12-01T19:45:44.000Z","lat":39.778,"lon":-86.1799,"distance":83.75294721277973},"stats":{"time":594,"distance":104389.05339403517},"path":[]}]
    
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

        async function getTrips() {
            let data = {max_date:new Date()}

            const res = await fetch("api/trips", { 
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)})
            .catch((error) => console.error(error));

            if (!ignore) {
                res.json().then((data) => {
                  console.log(data)
                  setTrips(data);
                })
                .catch((error) => console.error(error));
            }
        }
        
        getVersion();
        getTrips();

        return () => {ignore = true;}
      }, []);

    return (
        <Container>
            <h2>Trips</h2>

            <Pagination>
                <Pagination.Item key={30} active={true}>30</Pagination.Item>
                <Pagination.Item key={60}>60</Pagination.Item>
            </Pagination>

            <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Aircraft</th>
                    <th>Distance (miles)</th>
                    <th>Travel time (min)</th>
                </tr>
            </thead>
            <tbody>
                {trips.map((trip) => 
                    <tr key={trip.tid}>
                        <td><a href={"/trip/"+trip.tid}>View Trip</a></td>
                        <td>{trip.departure.display_name} @ {display_date(trip.departure.time)}</td>
                        <td>{trip.arrival.display_name} @ {display_date(trip.arrival.time)}</td>
                        <td>({trip.aid})</td>
                        <td>{trip.stats.distance.toFixed(2)}</td>
                        <td>{trip.stats.time}</td>
                    </tr>)}
            </tbody>
            </Table>
        </Container>
    )
}

export default Trips;