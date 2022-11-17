import { v4 as uuidv4 } from 'uuid';

function FlightSidebar(props) {
    const timeString = (time) => {
        const d = new Date(time);
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    }
    let meter_to_feet = (meter) => meter * 3.28084;
    let feet_to_meter = (feet) => feet * 0.3048;
 
    return (
        <div id="sidebar">
            <div id="all-flights">
                <table>
                    <tbody>
                    {props.flights.map(f => 
                        <tr key={uuidv4()}>
                            <td key={f.icao24}>
                                <div>
                                    <span>{f.latest.icao24} </span>
                                    <span>({f.latest.callsign})</span> 
                                </div>
                                <div>
                                    <i className="fa-regular fa-clock"></i>
                                    <span>{timeString(f.latest.time_position)}</span>
                                    <i className="fa-solid fa-tower-broadcast"></i>
                                    <span> {f.latest.squawk} </span>
                                </div>
                                <div>
                                    <i className="fa-regular fa-compass"></i>
                                    <span>{Math.round(f.latest.true_track)}</span>
                                    <i className="fa-solid fa-mountain-sun"></i>
                                    <span>{Math.round(meter_to_feet(f.latest.geo_altitude))}</span>
                                </div>
                                <div>
                                    <i className="fa-solid fa-gauge-high"></i>
                                    <span>{ Math.round(meter_to_feet(f.latest.velocity))} </span>
                                    {Math.round(meter_to_feet(f.latest.vertical_rate)) > 0 ? 
                                        <i className="fa-solid fa-up-long"></i> :
                                        Math.round(meter_to_feet(f.latest.vertical_rate)) < 0 ? 
                                        <i className="fa-solid fa-down-long"></i> :
                                        <i className="fa-solid fa-right-left"></i>}
                                    <span> {Math.round(meter_to_feet(f.latest.vertical_rate))} </span>
                                </div>
                                <div>
                                    <i className="fa-solid fa-location-crosshairs"></i>
                                    <span>{f.latest.latitude}, </span>
                                    <span>{f.latest.longitude}</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>)
}

export default FlightSidebar;