import React from "react";

import Container from 'react-bootstrap/Container';
import L from 'leaflet';
import { LayersControl, LayerGroup, Polyline, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet/hooks'



const limeOptions = { color: '#ee4035' }
const bbox = [[37, -88.028], [41.762, -84.809]];

function HospitalMarker(props) {
    const hospitalIcon = new L.divIcon({
        html: '<i class="fa-solid fa-hospital fa-2x" style="color:#0392cf;"></i>',
        iconSize: [20, 20],
        className: 'mapIcon'
    });

    return(
        <Marker position={[props.hospital.latitude, props.hospital.longitude]} icon={hospitalIcon} opacity={0.8}>
        </Marker>
    )
}

function FlightsMarker(props) {
    
    const flightIcon = (flight) => {
        let heading = (flight.latest.track + 270) % 360;
        let heading_p = heading;
        heading_p = heading>90&&heading<=180?180-heading:heading_p;;
        heading_p = heading>180&&heading<270?180-heading:heading_p;

        let color = "#034f84";

        if(flight.tracking.current.status ?? false) {
            if (flight.tracking.current.status === "grounded") { color = "#7bc043"; }
            else if (flight.tracking.current.status === "airborn") { color = "#ffa700"; }
            else if (flight.tracking.current.status === "los") { color = "#666666"; }
        }
        if(props.selectedSidebar.id === flight.icao24) { color = "#B10DC9"; }


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
    let selectedSidebar = props.selectedSidebar ?? {"tab":"flights", "id":null};
    let setSelectedSidebar = props.setSelectedSidebar ?? (() => {});

    return(
        <MapContainer  id="map"
                      bounds={box} 
                      scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <DeselectFlight setSelectedSidebar={setSelectedSidebar} />

            {selectedSidebar.id !== null ? 
                <MapPath 
                    key={"map-flight-path-selected-" + selectedSidebar.id} 
                    trip={trips.filter(t => t.aircraft.aid === selectedSidebar.id)[0]}></MapPath> :
                <></>}

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

                <LayersControl.Overlay name="Path">
                    <LayerGroup>
                        {trips.map(t => 
                            <MapPath key={"map-flight-path-" + t.aircraft.aid} trip={t}></MapPath>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;