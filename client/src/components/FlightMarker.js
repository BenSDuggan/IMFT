import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

function FlightsMarker(props) {
    
    const flightIcon = (heading) => {
        // fa-helicopter
        // fa-helicopter-symbol
        const airCraftIcon = new L.divIcon({
            html: '<i class="fa-solid fa-helicopter fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading + 'deg; color:#034f84;"></i>',
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
                icon={flightIcon((props.flight.latest.true_track + 270) % 360)}>
            <Popup>
                <span>{props.flight.icao24} ({props.flight.latest.callsign})</span>
            </Popup>
        </Marker>
    )
}

export default FlightsMarker;