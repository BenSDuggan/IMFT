import React from "react";

import L, { LatLngBoundsExpression }  from 'leaflet';
import { LayersControl, LayerGroup, Polyline, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet/hooks'

import { ADSB_State, Aircraft_State } from "../types/ADSB_Type";


const limeOptions = { color: '#ee4035' }
const bbox:LatLngBoundsExpression = [[36.558830, -89.570680], [39.148272, -81.965085]];


let category_to_marker = (category:string):string => {
    switch(category){
        case "Light":
            return "fa-plane";
        case "Small":
            return "fa-plane";
        case "Large":
            return "fa-plane";
        case "High Vortex Large":
            return "fa-plane";
        case "Heavy":
            return "fa-plane";
        case "Unmanned Aerial Vehicle":
            return "fa-person-circle-xmark";
        case "Glider, sailplane":
            return "Lighter-than-air";
            case "Glider, sailplane":
            return "fa-sailboat";
        case "Parachutist / Skydiver":
            return "fa-parachute-box";
        case "Ultralight, hang-glider, paraglider":
            return "fa-paper-plane";
        case "Space, Trans-atmospheric vehicle":
            return "fa-rocket";

        case "High Performance":
            return "fa-jet-fighter";
        case "Rotorcraft":
            return "fa-helicopter";
        case "Surface Vehicle - Emergency Vehicle":
            return "fa-car-side";
        case "Surface Vehicle - Service Vehicle":
            return "fa-car-side";
        case "Point Obstacle":
            return "fa-road-barrier";
        case "Cluster Obstacle":
            return "fa-road-barrier";
        case "Line Obstacle":
            return "fa-road-barrier";
        default:
            return "fa-plane-slash";
    }

    return "fa-plane-slash";
}

let ADSB_Marker = (props:any) => {
    let heading = (props.state.heading + 270) % 360;
    let heading_p = heading;
    heading_p = heading>90&&heading<=180?180-heading:heading_p;;
    heading_p = heading>180&&heading<270?180-heading:heading_p;

    let marker = category_to_marker(props.state.category);

    let color = "#034f84";

    const hospitalIcon = L.divIcon({
        html: '<span ' + (heading>90&&heading<270?'class="fa-flip-horizontal"':'') + ' style="display: inline-block;">'+
                    '<i class="fa-solid ' + marker + ' fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading_p +
                     'deg; color:'+color+';"></i></span>',
        className: 'mapIcon',
        iconSize: [20, 20],
        iconAnchor: [10, 10] // centers the icon
    });

    return(
        <Marker position={[props.state.lat, props.state.lon]} opacity={0.9} icon={hospitalIcon}>
        </Marker>
    )
}

/*
function HospitalMarker(props:any) {
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

function AircraftMarker(props:any) {
    
    const flightIcon = (flight) => {
        let heading = (flight.track + 270) % 360;
        let heading_p = heading;
        heading_p = heading>90&&heading<=180?180-heading:heading_p;;
        heading_p = heading>180&&heading<270?180-heading:heading_p;

        let color = "#034f84";


        // fa-helicopter
        // fa-helicopter-symbol
        const airCraftIcon = new L.divIcon({
            html: '<span ' + (heading>90&&heading<270?'class="fa-flip-horizontal"':'') + ' style="display: inline-block;">'+
                    '<i class="fa-solid fa-plane fa-2x fa-rotate-by" style="--fa-rotate-angle: ' + heading_p +
                     'deg; color:'+color+';"></i></span>',
            iconSize: [20, 20],
            className: 'mapIcon'
        });

        return airCraftIcon
    }

    return(
        <Marker position={[props.flight.latitude, props.flight.longitude]} 
                icon={flightIcon(props.flight)}
                eventHandlers={{
                    click: () => {
                      props.setSelectedSidebar(props.flight.icao24)
                    },
                  }}>
        </Marker>
    )
}

function FlightsMarker(props:any) {
    
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

function DeselectFlight(props:any) {
    useMapEvents({
      click: () => {
        props.setSelectedSidebar('flights')
      }
    })
    return null
}
    */

function MapPath(props:any) {
    return ( <Polyline pathOptions={limeOptions} positions={props.trip.path} /> )
}

let Map = (props:any) => {
    let adsb:Aircraft_State[] = props.adsb ? props.adsb : [];
    let hospitals = props.hospitals ?? [];
    let flights = props.flights ?? [];
    let trips = props.trips ?? [];
    let nfd = props.nfd ?? [];
    let selectedSidebar = props.selectedSidebar ?? {"tab":"flights", "id":null};
    let setSelectedSidebar = props.setSelectedSidebar ?? (() => {});

    return(
        <MapContainer  id="map"
                      bounds={bbox} 
                      scrollWheelZoom={true}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <LayersControl position="topright">
                <LayersControl.Overlay checked name="ADSB">
                    <LayerGroup>
                        {adsb.map(a => 
                            <ADSB_Marker key={"map-hospital-" + a.icao24} state={a}></ADSB_Marker>
                        )};
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>

            
        </MapContainer>
    )
}

export default Map;

/*
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
                <LayersControl.Overlay name="All Aircraft">
                    <LayerGroup>
                        {nfd.map(n => 
                            <AircraftMarker key={"map-flights-" + n.icao24}
                                            flight={n} ></AircraftMarker>
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
*/