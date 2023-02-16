
import React, {useEffect, useState} from "react";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import Table from 'react-bootstrap/Table';

function Trips(props) {
    const [range, setRange] = useState("1w");
    const [trips, setTrips] = useState([]);
    const [option, setOption] = useState({"min_date":new Date(new Date() - 604800*1000), "page":0})
    
    let display_date = (date) => new Date(date).toLocaleString();

    async function get_trips(ignore) {
        let data = {min_date:option.min_date, page:option.page};

        const res = await fetch("api/trips", { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)})
        .catch((error) => console.error(error));

        if (!ignore) {
            res.json().then((data) => {
                let t = JSON.parse(JSON.stringify(trips));
                t.push(...data)
                setTrips(t);
            })
            .catch((error) => console.error(error));
        }
    }

    let set_filter_date = (key) => {
        setRange(key);

        switch (key) {
            case '1d':
                setOption({...option, min_date:new Date(new Date() - 1*24*60*60*1000)});
                break;
            case '1w':
                setOption({...option, min_date:new Date(new Date() - 7*24*60*60*1000)});
                break;
            case '1m':
                setOption({...option, min_date:new Date(new Date() - 30*24*60*60*1000)});
                break;
            case '2m':
                setOption({...option, min_date:new Date(new Date() - 60*24*60*60*1000)});
                break;
            case '3m':
                setOption({...option, min_date:new Date(new Date() - 90*24*60*60*1000)});
                break;
            default:
                setOption({...option, min_date:new Date(new Date() - 1*24*60*60*1000)});
        }
    }

    useEffect(() => {
        let ignore = false;

        get_trips(ignore);

        return () => {ignore = true;}
      }, [option]);

    return (
        <Container className="main" fluid="lg">
            <h2>Trips</h2>

            <Pagination>
                <Pagination.Item key={'1d'} active={'1d' === range} onClick={()=>set_filter_date('1d')}>1 D</Pagination.Item>
                <Pagination.Item key={'1w'} active={'1w' === range} onClick={()=>set_filter_date('1w')}>1 W</Pagination.Item>
                <Pagination.Item key={'1m'} active={'1m' === range} onClick={()=>set_filter_date('1m')}>1 M</Pagination.Item>
                <Pagination.Item key={'2m'} active={'2m' === range} onClick={()=>set_filter_date('2m')}>2 M</Pagination.Item>
                <Pagination.Item key={'3m'} active={'3m' === range} onClick={()=>set_filter_date('3m')}>3 M</Pagination.Item>
            </Pagination>
            <Container className="table-responsive">
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
                            <td>{trip.aircraft.display_name} <span>&#47;</span> <span>&#47;</span> N{trip.aircraft["N-NUMBER"]}</td>
                            <td>{trip.stats.distance.toFixed(2)}</td>
                            <td>{Math.round(trip.stats.time/60)}</td>
                        </tr>)}
                </tbody>
                </Table>
            </Container>
            <Button variant="secondary" onClick={()=>setOption({...option, page:option.page + 1})}>Load more</Button>
        </Container>
    )
}

export default Trips;