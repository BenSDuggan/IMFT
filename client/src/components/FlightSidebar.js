

function FlightSidebar(props) {
    

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
                                    <span>{f.latest.callsign}</span> 
                                </div>
                                <div>
                                    <i class="fa-regular fa-compass"></i>
                                    <span>{f.latest.true_track}</span>
                                    <i class="fa-solid fa-mountain-sun"></i>
                                    <span>{f.latest.geo_altitude}</span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-gauge-high"></i>
                                    <span>{ f.latest.velocity} </span>
                                    <i class="fa-solid fa-up-right"></i>
                                    <span> {f.latest.vertical_rate} </span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-location-crosshairs"></i>
                                    <span>{f.latest.latitude}</span>
                                    <span>{f.latest.longitude}</span>
                                    <span>Time</span>
                                </div>
                            </td>
                        </tr>
                    )};
                </tbody>
                </table>
            </div>
        </div>)
}

export default FlightSidebar;