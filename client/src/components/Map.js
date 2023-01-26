import { MapContainer, TileLayer, LayersControl, LayerGroup } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet/hooks'

import HospitalMarker  from './HospitalMarker'
import FlightsMarker  from './FlightMarker'
import MapPath from './MapPath'

const bbox = [[37, -88.028], [41.762, -84.809]];

function DeselectFlight(props) {
    const map = useMapEvents({
      click: () => {
        props.setSelectedSidebar('flights')
      }
    })
    return null
  }

function Map(props) {
    
    return(
        <MapContainer id="map" 
                      bounds={bbox} 
                      scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <DeselectFlight setSelectedSidebar={props.setSelectedSidebar} />

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
                            <FlightsMarker key={"map-flights-" + f.icao24}
                                            flight={f} 
                                            selectedSidebar={props.selectedSidebar} 
                                            setSelectedSidebar={props.setSelectedSidebar}></FlightsMarker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Path">
                    <LayerGroup>
                        {props.trips.map(t => 
                            <MapPath key={"map-flight-path-" + t.aid} trip={t} selectedSidebar={props.selectedSidebar}></MapPath>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;