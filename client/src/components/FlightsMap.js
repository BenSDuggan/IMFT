import { Marker } from 'react-leaflet'
import L from 'leaflet';

function FlightsMap() {
    let flightIcon = (heading) => {
        // fa-helicopter
        const airCraftIcon = L.divIcon({
            html: '<i class="fa-solid fa-plane fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading + 'deg; color:#034f84;"></i>',
            iconSize: [20, 20],
            className: 'mapIcon'
        });
        return airCraftIcon
    }

    return(
        <Marker position={[38, -86.028]} icon={flightIcon(45)}>
        </Marker>
    )
}

export default FlightsMap;