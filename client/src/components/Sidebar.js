
import React from "react";

import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';

import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';
import FlightSelected from './FlightSelected'

function Sidebar(props) {
    

    return (
        <>
            {Object.keys(props.metadata).length > 0 && props.metadata.active ? <MetaData data={props.metadata} socket={props.socket}></MetaData> : <></>}


            <Pagination>
                <Pagination.Item 
                    key={'flights'} 
                    active={props.selectedSidebar.tab==='flights'} 
                    onClick={() => props.setSelectedSidebar("flights")}
                    className="">
                        Flights
                </Pagination.Item>
                <Pagination.Item
                    key={'hospitals'} 
                    active={props.selectedSidebar.tab==='hospitals'} 
                    onClick={() => props.setSelectedSidebar("hospitals")}
                    className="">
                        Hospitals
                </Pagination.Item>
            </Pagination>

            <div id="sidebar-flights" style={{display:props.selectedSidebar.tab==='flights' ? 'block' : 'none'}}>
                <FlightSidebar flights={props.flights} selectFlight={props.setSelectedSidebar}></FlightSidebar>
            </div>
            <div id="sidebar-hospitals" style={{display:props.selectedSidebar.tab==='hospitals' ? 'block' : 'none'}}>
                Hospitals
            </div>
            <div id="sidebar-selected-flight" style={{display:props.selectedSidebar.tab==='selected-flight' ? 'block' : 'none'}}>
                {props.selectedSidebar.tab==='selected-flight' ? 
                <FlightSelected 
                    flight={props.flights.filter(f => f.icao24 === props.selectedSidebar.id)[0]}
                    trip={props.trips.filter(t => t.aid === props.selectedSidebar.id)[0]}
                    ></FlightSelected> :
                <h2>Selected Flight (non selected)</h2>}
            </div>
        </>
        )
}

export default Sidebar;