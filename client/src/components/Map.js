import { MapContainer, TileLayer, LayersControl, LayerGroup } from 'react-leaflet'
import HospitalMarker  from './HospitalMarker'
import FlightsMarker  from './FlightMarker'

const bbox = [[37, -88.028], [41.762, -84.809]];


function Map(props) {
    
    return(
        <MapContainer id="map" bounds={bbox} scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <LayersControl position="topright">
                <LayersControl.Overlay checked name="Hospitals">
                    <LayerGroup>
                        {props.hospitals.map(h => 
                            <HospitalMarker key={"map-hospital-" + h.id}  hospital={h}></HospitalMarker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Flights">
                    <LayerGroup>
                        {props.flights.map(f => 
                            <FlightsMarker key={"map-flights-" + f.icao24}  flight={f}></FlightsMarker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;