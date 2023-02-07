import React from "react";

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

function FlightsMarker(props) {
    
    const flightIcon = (flight) => {
        const heading = (flight.latest.true_track + 270) % 360;
        let color = "#034f84";

        if(flight.tracking.current.status ?? false) {
            if (flight.tracking.current.status === "grounded") { color = "#7bc043"; }
            else if (flight.tracking.current.status === "airborn") { color = "#ffa700"; }
            else if (flight.tracking.current.status === "los") { color = "#666666"; }
        }
        if(props.selectedSidebar.id == flight.icao24) { color = "#B10DC9"; }


        // fa-helicopter
        // fa-helicopter-symbol
        const airCraftIcon = new L.divIcon({
            html: '<i class="fa-solid fa-helicopter fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading + 'deg; color:'+color+';"></i>',
            iconSize: [20, 20],
            className: 'mapIcon'
        });

        const myCustomColour = '#583470'

        const markerHtmlStyles = `
        background-color: ${myCustomColour};
        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        border-radius: 3rem 3rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF`


        const airCraftIcon2 = new L.icon({
            className: "my-custom-pin",
            iconUrl: 'helicopter.svg',
            iconSize: [35],
        });
        return airCraftIcon2
    }

    return(
        <Marker position={[props.flight.latest.latitude, props.flight.latest.longitude]} 
                icon={flightIcon(props.flight)}
                eventHandlers={{
                    click: () => {
                      props.setSelectedSidebar(props.flight.icao24)
                    },
                  }}>
        </Marker>
    )
}

export default FlightsMarker;