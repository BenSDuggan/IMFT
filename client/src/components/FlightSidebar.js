

function FlightSidebar(props) {
    const timeString = (time) => {
        const d = new Date(time);
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    }

    return (
        <div id="sidebar">
            <div id="all-flights">
                <table>
                    <tbody>
                    {props.flights.map(f => 
                        <tr>
                            <td key={f.icao24}>
                                <div>
                                    <span>{f.latest.icao24} </span>
                                    <span>({f.latest.callsign})</span> 
                                </div>
                                <div>
                                    <i class="fa-regular fa-clock"></i>
                                    <span>{timeString(f.latest.time_position)}</span>
                                    <i class="fa-solid fa-location-question"></i>
                                    <span> Destination</span>
                                </div>
                                <div>
                                    <i class="fa-regular fa-compass"></i>
                                    <span>{Math.round(f.latest.true_track)}</span>
                                    <i class="fa-solid fa-mountain-sun"></i>
                                    <span>{Math.round(f.latest.geo_altitude)}</span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-gauge-high"></i>
                                    <span>{ Math.round(f.latest.velocity)} </span>
                                    <i class="fa-solid fa-wifi"></i>
                                    <span> {Math.round(f.latest.vertical_rate)} </span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-location-crosshairs"></i>
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