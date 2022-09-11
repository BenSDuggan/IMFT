import { MapContainer, TileLayer } from 'react-leaflet'
import HospitalMap  from './HospitalMap'
import FlightsMap  from './FlightsMap'

const bbox = [[37, -88.028], [41.762, -84.809]];


function FlightMap(props) {

    return(
        <MapContainer id="map" bounds={bbox} scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {props.hospitals.map(h => 
                <HospitalMap key={"map-hospital-" + h.id}  hospital={h}></HospitalMap>
            )};


        </MapContainer>
    )
}

export default FlightMap;