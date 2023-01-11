
import React, { useState, useEffect, useContext } from "react";

import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';
import FlightSelected from './FlightSelected'

function Sidebar(props) {
    

    return (
        <div id="sidebar">
            {Object.keys(props.metadata).length > 0 && props.metadata.active ? <MetaData data={props.metadata} socket={props.socket}></MetaData> : <div></div>}


            <div className="sidebar-nav" id="sidebar-menu">
                <button className="sidebar-nav-button" 
                        onClick={() => props.setSelectedSidebar("flights")}
                        style={{ backgroundColor:props.selectedSidebar.tab=='flights' ? '#0084ff' : 'inherit'}}>Flights</button>
                <button className="sidebar-nav-button" 
                        onClick={() => props.setSelectedSidebar("hospitals")}
                        style={{ backgroundColor:props.selectedSidebar.tab=='hospitals' ? '#0084ff' : 'inherit'}}>Hospitals</button>
            </div>

            <div id="sidebar-flights" style={{display:props.selectedSidebar.tab=='flights' ? 'block' : 'none'}}>
                <FlightSidebar flights={props.flights} selectFlight={props.setSelectedSidebar}></FlightSidebar>
            </div>
            <div id="sidebar-hospitals" style={{display:props.selectedSidebar.tab=='hospitals' ? 'block' : 'none'}}>
                Hospitals
            </div>
            <div id="sidebar-selected-flight" style={{display:props.selectedSidebar.tab=='selected-flight' ? 'block' : 'none'}}>
                {props.selectedSidebar.tab=='selected-flight' ? 
                <FlightSelected flight={props.flights.filter(f => f.icao24 == props.selectedSidebar.id)[0]}></FlightSelected> :
                <h2>Selected Flight (non selected)</h2>}
            </div>
        </div>
        )
}

export default Sidebar;