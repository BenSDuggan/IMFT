import React, {useState} from "react";

import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';


let meter_to_feet = (meter) => meter * 3.28084;

let FlightRow = (props) => {
    let f = props.flight;

    return (
    <tr className='' onClick={() => props.selectFlight(f.icao24)}>
        <td>{"N"+f.faa["N-NUMBER"]}</td>
        <td>{f.latest.squawk}</td>
        <td>{f.faa.NAME}</td>
        <td>{f.tics}</td>
        <td>{Math.round(meter_to_feet(f.latest.geo_altitude))}</td>
        <td>{ Math.round(meter_to_feet(f.latest.velocity))}</td>
        <td>{Math.round(meter_to_feet(f.latest.vertical_rate)) > 0 ? 
            <i className="fa-solid fa-up-long"></i> :
            Math.round(meter_to_feet(f.latest.vertical_rate)) < 0 ? 
            <i className="fa-solid fa-down-long"></i> :
            <i className="fa-solid fa-right-left"></i>}
            <span> {Math.round(meter_to_feet(f.latest.vertical_rate))} </span>
        </td>
        <td>{Math.round(f.latest.track)}</td>
    </tr>
    )
}

let FlightTable = (props) => {

    return (
        <Container className='table-responsive' >
        <Table key={"table_"+props.status}>
            <thead>
                <tr>
                    <th><i className="fa-solid fa-plane"></i></th>
                    <th><i className="fa-solid fa-tower-broadcast"></i></th>
                    <th>Name</th>
                    <th><i className="fa-regular fa-compass"></i></th>
                    <th><i className="fa-solid fa-mountain-sun"></i></th>
                    <th><i className="fa-solid fa-gauge-high"></i></th>
                    <th><i className="fa-solid fa-arrow-trend-up"></i></th>
                    <th><i className="fa-solid fa-clock"></i></th>
                </tr>
            </thead>
            <tbody>
                {props.flights.map(f => 
                    <FlightRow flight={f} selectFlight={props.selectFlight} key={"table-body_"+f.icao24}></FlightRow>
                )}
            </tbody>
        </Table>
        </Container>
    )
}


let FlightSidebar = (props) => {
    const [accordion, setAccordion] = useState(['airborn', 'grounded']);

    let airborn = props.flights.filter(f => f.tracking.current.status === "airborn");
    let grounded = props.flights.filter(f => f.tracking.current.status === "grounded");
    let los = props.flights.filter(f => f.tracking.current.status === "los");

    let select_accordion = (key) => {
        if(accordion.includes(key)) {
            let a = accordion;
            a = a.filter((aa) => aa !== key);
            setAccordion(a);
        }
        else if(key !== null) {
            setAccordion(prevState => (
                [...prevState, key]
            ))
        }
    }

    return (
        <Accordion flush activeKey={accordion} onSelect={select_accordion}>
            <Accordion.Item eventKey="airborn">
                <Accordion.Header>Airborn ({airborn.length})</Accordion.Header>
                <Accordion.Body style={{padding:"0px"}}>
                    <FlightTable flights={airborn} selectFlight={props.selectFlight} status="airborn"></FlightTable>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="grounded">
                <Accordion.Header>Grounded ({grounded.length})</Accordion.Header>
                <Accordion.Body style={{padding:"0px"}}>
                    <FlightTable flights={grounded} selectFlight={props.selectFlight} status="grounded"></FlightTable>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="los">
                <Accordion.Header>Loss of Signal ({los.length})</Accordion.Header>
                <Accordion.Body style={{padding:"0px"}}>
                    <FlightTable flights={los} selectFlight={props.selectFlight} status="los"></FlightTable>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>)
}

export default FlightSidebar;