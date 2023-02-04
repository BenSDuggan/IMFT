import React from "react";

import { Marker } from 'react-leaflet'
import L from 'leaflet';

function HospitalMarker(props) {

    const hospitalIcon = new L.divIcon({
        html: '<i class="fa-solid fa-hospital fa-2x" style="color:#f7786b;"></i>',
        iconSize: [20, 20],
        className: 'mapIcon'
    });

    return(
        <Marker position={[props.hospital.latitude, props.hospital.longitude]} icon={hospitalIcon}>
        </Marker>
    )
}

export default HospitalMarker;