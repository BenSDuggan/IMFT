import { Marker } from 'react-leaflet'
import L from 'leaflet';

function FlightsMarker(props) {
    
    const flightIcon = (heading) => {
        // fa-helicopter
        const airCraftIcon = new L.divIcon({
            html: '<i class="fa-solid fa-helicopter-symbol fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading + 'deg; color:#034f84;"></i>',
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
        </Marker>
    )
}

export default FlightsMarker;