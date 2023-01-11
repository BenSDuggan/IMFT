
import React, { useState, useEffect, useContext } from "react";

import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';

function Sidebar(props) {
    const [selectedSidebar, setSelectedSidebar] = useState("flights");

    let handelClick = (d) => {
        setSelectedSidebar(d);
    }

    return (
        <div id="sidebar">
            {Object.keys(props.metadata).length > 0 && props.metadata.active ? <MetaData data={props.metadata} socket={props.socket}></MetaData> : <div></div>}


            <div className="sidebar-nav" id="sidebar-menu">
                <button className="sidebar-nav-button" 
                        onClick={() => handelClick("flights")}
                        style={{ backgroundColor:selectedSidebar=='flights' ? '#0084ff' : 'inherit'}}>Flights</button>
                <button className="sidebar-nav-button" 
                        onClick={() => handelClick("hospitals")}
                        style={{ backgroundColor:selectedSidebar=='hospitals' ? '#0084ff' : 'inherit'}}>Hospitals</button>
            </div>

            <div id="sidebar-flights" style={{display:selectedSidebar=='flights' ? 'block' : 'none'}}>
                <FlightSidebar flights={props.flights}></FlightSidebar>
            </div>
            <div id="sidebar-hospitals" style={{display:selectedSidebar=='hospitals' ? 'block' : 'none'}}>
                Hospitals
            </div>
            <div id="sidebar-selected-flight" style={{display:selectedSidebar=='selected-flight' ? 'block' : 'none'}}>
                Selected
            </div>
        </div>
        )
}

export default Sidebar;