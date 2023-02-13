
import React from "react";

import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';
import FlightSelected from './FlightSelected'

function Sidebar(props) {
    

    return (
        <>
            {Object.keys(props.metadata).length > 0 && props.metadata.active ? <MetaData data={props.metadata} socket={props.socket}></MetaData> : <></>}

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
                    trip={props.trips.filter(t => t.aircraft.aid === props.selectedSidebar.id)[0]}
                ></FlightSelected> :
                <h2>Selected Flight (non selected)</h2>}
            </div>
        </>
        )
}

export default Sidebar;