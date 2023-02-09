
import React from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Map from './Map';
import Sidebar from './Sidebar';

function Live(props) {    

    return (
        <Container className="main" id="main_live" fluid="true">
            <Row className="fill_grid">
            <Col sm={4} className="fill_grid">
            <Sidebar 
                flights={props.flights} 
                trips={props.trips} 
                metadata={props.metadata} 
                socket={props.socket} 
                selectedSidebar={props.selectedSidebar} 
                setSelectedSidebar={props.setSelectedSidebar}>    
            </Sidebar>
            </Col>
            <Col sm={8} className="fill_grid">
            <Map 
                hospitals={props.hospitals} 
                flights={props.flights} 
                trips={props.trips} 
                selectedSidebar={props.selectedSidebar} 
                setSelectedSidebar={props.setSelectedSidebar}>    
            </Map>
            </Col>
            </Row>
        </Container>
    )
}

export default Live;