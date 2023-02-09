
import React, {useEffect, useState} from "react";

import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import Table from 'react-bootstrap/Table';

function Trips(props) {
    const [trips, setTrips] = useState([]);
    
    let display_date = (date) => new Date(date).toLocaleString();

    useEffect(() => {
        let ignore = false;

        async function getTrips() {
            let data = {max_date:new Date()}

            const res = await fetch("api/trips", { 
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)})
            .catch((error) => console.error(error));

            if (!ignore) {
                res.json().then((data) => {
                  setTrips(data);
                })
                .catch((error) => console.error(error));
            }
        }
        getTrips();

        return () => {ignore = true;}
      }, []);

    return (
        <Container className="main" fluid="lg">
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