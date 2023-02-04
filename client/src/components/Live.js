
import React from "react";

import Map from './Map';
import Sidebar from './Sidebar';

function Live(props) {    

    return (
        <div id="main-container_live">
            <Sidebar 
                flights={props.flights} 
                trips={props.trips} 
                metadata={props.metadata} 
                socket={props.socket} 
                selectedSidebar={props.selectedSidebar} 
                setSelectedSidebar={props.setSelectedSidebar}>    
            </Sidebar>
            <Map 
                hospitals={props.hospitals} 
                flights={props.flights} 
                trips={props.trips} 
                selectedSidebar={props.selectedSidebar} 
                setSelectedSidebar={props.setSelectedSidebar}>    
            </Map>
        </div>
    )
}

export default Live;