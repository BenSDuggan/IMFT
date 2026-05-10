
import React from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Map from './Map';
import Sidebar from './Sidebar';

let Live = (props:any) => {    

    return (
        <>
        <Container className="d-md-block d-none" id="main_live" fluid="true">
            <Row className="fill_grid">
            <Col  className="fill_grid" id="sidebar" >
            Sidebar
            </Col>
            <Col sm={8} className="fill_grid">
                <Container fluid="true" id="map">
                <Map 
                    adsb={props.adsb}>    
                </Map>
            </Container>
            </Col>
            </Row>
        </Container>
        
        </>
    )
}

/*
<Sidebar 
                flights={props.flights} 
                trips={props.trips} 
                metadata={props.metadata} 
                socket={props.socket} 
                selectedSidebar={props.selectedSidebar} 
                setSelectedSidebar={props.setSelectedSidebar}>    
            </Sidebar>
            */


export default Live;

/*
<Container className="d-md-none d-block fill_grid" id="main_live" fluid>
            <Row>
            <Container fluid="true" style={{height:"50vh"}}>
                <Map 
                    hospitals={props.hospitals} 
                    flights={props.flights} 
                    trips={props.trips} 
                    selectedSidebar={props.selectedSidebar} 
                    setSelectedSidebar={props.setSelectedSidebar}>    
                </Map>
            </Container>
            </Row>
            <Row>
                <Sidebar 
                    flights={props.flights} 
                    trips={props.trips} 
                    metadata={props.metadata} 
                    socket={props.socket} 
                    selectedSidebar={props.selectedSidebar} 
                    setSelectedSidebar={props.setSelectedSidebar}>    
                </Sidebar>
            </Row>
        </Container>
        */