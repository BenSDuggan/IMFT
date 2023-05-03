
import React, {useEffect, useState} from "react";

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

function Aircraft(props) {
    const [range, setRange] = useState("1d");
    const [trips, setTrips] = useState([]);
    const [option, setOption] = useState({
        "min_date":new Date(new Date() - 90*24*60*60*1000), 
        "max_date": new Date(), 
        "lid":props.lid ?? null, 
        "page":0, 
        "submit":true})
    
    let display_date = (date) => new Date(date).toLocaleString();

    async function get_trips(ignore) {
        if(!option.submit)
            return
        else
            setOption({...option, submit:false})

        let data = {min_date:option.min_date, max_date:option.max_date, page:option.page};

        const res = await fetch("api/trips", { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)})
        .catch((error) => console.error(error));

        if (!ignore) {
            res.json().then((data) => {
                console.log(data)
                let t = JSON.parse(JSON.stringify(trips));

                if(option.page === 0)
                    setTrips(data);
                else {
                    t.push(...data)
                    setTrips(t);
                }
            })
            .catch((error) => console.error(error));
        }
    }

    let set_filter_date = (key) => {
        setRange(key);

        switch (key) {
            case '1d':
                setOption({...option, min_date:new Date(new Date() - 1*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '1w':
                setOption({...option, min_date:new Date(new Date() - 7*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '1m':
                setOption({...option, min_date:new Date(new Date() - 30*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '2m':
                setOption({...option, min_date:new Date(new Date() - 60*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '3m':
                setOption({...option, min_date:new Date(new Date() - 90*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            default:
                setOption({...option, min_date:new Date(new Date() - 1*24*60*60*1000), max_date:new Date(), page:0, submit:true});
        }
    }

    useEffect(() => {
        let ignore = false;

        get_trips(ignore);

        return () => {ignore = true;}
      }, [option]);

    return (
        <Container className="main" fluid="lg">
            <h2>Aircraft</h2>
            <Container>
                <Row>
                    <Col sm={3}>
                        <Pagination>
                            <Pagination.Item key={'1d'} active={'1d' === range} onClick={()=>set_filter_date('1d')}>1 D</Pagination.Item>
                            <Pagination.Item key={'1w'} active={'1w' === range} onClick={()=>set_filter_date('1w')}>1 W</Pagination.Item>
                            <Pagination.Item key={'1m'} active={'1m' === range} onClick={()=>set_filter_date('1m')}>1 M</Pagination.Item>
                            <Pagination.Item key={'2m'} active={'2m' === range} onClick={()=>set_filter_date('2m')}>2 M</Pagination.Item>
                            <Pagination.Item key={'3m'} active={'3m' === range} onClick={()=>set_filter_date('3m')}>3 M</Pagination.Item>
                        </Pagination>
                    </Col>
                    <Col sm={3} className="trip-date-container">
                        <input 
                            className="trip-date-input"
                            type="date" 
                            value={option.min_date.toISOString().split("T")[0]} 
                            min="1970-01-01" 
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setOption({...option, min_date:new Date(e.target.value)})}></input>
                        <span style={{padding: "0px 5px 0px 5px"}}>-</span>
                        <input 
                            type="date" 
                            value={option.max_date.toISOString().split("T")[0]} 
                            min="1970-01-01" 
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setOption({...option, max_date:new Date(e.target.value)})}></input>
                    </Col>
                    <Col sm={1}>
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                setOption({...option, page:0, submit:true})
                                setRange("other")
                            }}>Filter</Button>
                    </Col>
                </Row>
            </Container>
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
            <Button variant="secondary" onClick={()=>setOption({...option, page:option.page + 1, submit:true})}>Load more</Button>
        </Container>
    )
}

export default Aircraft;