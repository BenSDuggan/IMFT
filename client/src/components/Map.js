import React from "react";

import { MapContainer, TileLayer, LayersControl, LayerGroup, Polyline } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet/hooks'

import HospitalMarker  from './HospitalMarker'
import FlightsMarker  from './FlightMarker'


const limeOptions = { color: 'lime' }
const bbox = [[37, -88.028], [41.762, -84.809]];

function DeselectFlight(props) {
    useMapEvents({
      click: () => {
        props.setSelectedSidebar('flights')
      }
    })
    return null
}

function MapPath(props) {
    return ( <Polyline pathOptions={limeOptions} positions={props.trip.path} /> )
}

function Map(props) {
    let box = props.bbox ?? bbox;
    let hospitals = props.hospitals ?? [];
    let flights = props.flights ?? [];
    let trips = props.trips ?? [];
    let selectedSidebar = props.selectedSidebar ?? "";
    let setSelectedSidebar = props.setSelectedSidebar ?? (() => {});

    return(
        <MapContainer id="map" 
                      bounds={box} 
                      scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <DeselectFlight setSelectedSidebar={setSelectedSidebar} />

            <LayersControl position="topright">
                <LayersControl.Overlay checked name="Hospitals">
                    <LayerGroup>
                        {hospitals.map(h => 
                            <HospitalMarker key={"map-hospital-" + h.id}  hospital={h}></HospitalMarker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Flights">
                    <LayerGroup>
                        {flights.map(f => 
                            <FlightsMarker key={"map-flights-" + f.icao24}
                                            flight={f} 
                                            selectedSidebar={selectedSidebar} 
                                            setSelectedSidebar={setSelectedSidebar}></FlightsMarker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Path">
                    <LayerGroup>
                        {trips.map(t => 
                            <MapPath key={"map-flight-path-" + t.aid} trip={t} selectedSidebar={selectedSidebar}></MapPath>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;