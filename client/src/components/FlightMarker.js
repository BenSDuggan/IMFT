import React from "react";

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

function FlightsMarker(props) {
    
    const flightIcon = (flight) => {
        let heading = (flight.latest.true_track + 270) % 360;
        let heading_p = heading;
        heading_p = heading>90&&heading<=180?180-heading:heading_p;;
        heading_p = heading>180&&heading<270?180-heading:heading_p;
        console.log(heading_p)

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
            html: '<span ' + (heading>90&&heading<270?'class="fa-flip-horizontal"':'') + ' style="display: inline-block;">'+
                    '<i class="fa-solid fa-helicopter fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading_p +
                     'deg; color:'+color+';"></i></span>',
            iconSize: [20, 20],
            className: 'mapIcon'
        });

        return airCraftIcon
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