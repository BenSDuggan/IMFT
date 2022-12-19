import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

function FlightsMarker(props) {
    
    const flightIcon = (flight) => {
        const heading = (flight.latest.true_track + 270) % 360;
        let color = "#034f84";

        if(flight.tracking.current.status ?? false) {
            if (flight.tracking.current.status === "grounded") {
                color = "#5be7a9";
            }
            else if (flight.tracking.current.status === "airborn") {
                color = "#ff6464";
            }
            else if (flight.tracking.current.status === "los") {
                color = "#666666";
            }
        }

        // fa-helicopter
        // fa-helicopter-symbol
        const airCraftIcon = new L.divIcon({
            html: '<i class="fa-solid fa-helicopter fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading + 'deg; color:'+color+';"></i>',
            iconSize: [20, 20],
            className: 'mapIcon'
        });
        const airCraftIcon2 = new L.icon({
            iconUrl: 'helicopter.svg',
            iconSize: [35],
        });
        return airCraftIcon
    }

    return(
        <Marker position={[props.flight.latest.latitude, props.flight.latest.longitude]} 
                icon={flightIcon(props.flight)}>
            <Popup>
                <span>{props.flight.icao24} ({props.flight.latest.callsign})</span>
            </Popup>
        </Marker>
    )
}

export default FlightsMarker;