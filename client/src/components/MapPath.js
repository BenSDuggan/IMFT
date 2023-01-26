import { Polyline } from 'react-leaflet/Polyline'


function MapPath(props) {

    const limeOptions = { color: 'lime' }

    return(
        <Polyline pathOptions={limeOptions} positions={props.trip.path} />
    )
}

export default MapPath;