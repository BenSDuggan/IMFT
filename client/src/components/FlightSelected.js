import { v4 as uuidv4 } from 'uuid';

function FlightSelected(props) {
    const timeString = (time) => {
        const d = new Date(time*1000);
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    }

    let meter_to_feet = (meter) => meter * 3.28084;
    let feet_to_meter = (feet) => feet * 0.3048;

    const f = props.flight;
 
    return (
        <div key={f.icao24}>
            <div>
                <div>
                    <span>{"N"+f.faa["N-NUMBER"]} </span>
                    <span>({f.latest.icao24})</span> 
                    <i className="fa-solid fa-tower-broadcast"></i>
                    <span> {f.latest.squawk} </span>
                </div>
                <div>
                    <span>{f.faa.NAME}</span>
                </div>


                <div>
                    <i className="fa-regular fa-clock"></i>
                    <span>{timeString(f.latest.time_position)} </span>
                    <span>Tics: {f.tics} </span>
                </div>


                <div>
                    <i className="fa-regular fa-compass"></i>
                    <span>{Math.round(f.latest.true_track)}</span>
                    <i className="fa-solid fa-mountain-sun"></i>
                    <span>{Math.round(meter_to_feet(f.latest.geo_altitude))}</span>
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
            </div>
            <hr />

            <div>
                <h3>Trip</h3>
                <table style={{width:'100%'}}>
                    <tbody>
                        <tr style={{"vertical-align":'top', display: 'inline-block'}}>
                            <td style={{width:'50%'}}>
                                <strong>Departure</strong> <br />
                                <span>Status: {f.tracking.previous.status ?? "NA"}</span><br/>
                                <span>Reason: {f.tracking.previous.reason ?? "NA"}</span><br/>
                                <span>Tics: {f.tracking.previous.tics ?? "NA"}</span><br/>
                                <span>Counter: {f.tracking.previous.counter ?? "NA"}</span><br/>
                                <span>Time: {new Date(f.tracking.previous.time ?? 0).toLocaleString()}</span><br/>
                                {f.tracking.previous.location != null ? 
                                <div>
                                    <span>Location: {f.tracking.previous.location.display_name ?? "NA"}</span><br/>
                                    <span>Type: {f.tracking.previous.location.type ?? "NA"}</span><br/>
                                    <span>Distance: {Math.round(f.tracking.previous.location.distance) ?? "NA"}</span><br/>
                                    <span>Zone: {f.tracking.current.location.zone ?? "NA"}</span><br/>
                                </div>:
                                <span>Location: NA</span>}
                            </td>
                            <td style={{width:'50%'}}>
                                <strong>Arrival</strong> <br/>
                                <span>Status: {f.tracking.current.status ?? "NA"}</span><br/>
                                <span>Reason: {f.tracking.current.reason ?? "NA"}</span><br/>
                                <span>Tics: {f.tracking.current.tics ?? "NA"}</span><br/>
                                <span>Counter: {f.tracking.current.counter ?? "NA"}</span><br/>
                                <span>Time: {new Date(f.tracking.current.time ?? 0).toLocaleString()}</span><br/>
                                {f.tracking.current.location != null ? 
                                <div>
                                    <span>Location: {f.tracking.current.location.display_name ?? "NA"}</span><br/>
                                    <span>Type: {f.tracking.current.location.type ?? "NA"}</span><br/>
                                    <span>Distance: {Math.round(f.tracking.current.location.distance) ?? "NA"}</span><br/>
                                    <span>Zone: {f.tracking.current.location.zone ?? "NA"}</span><br/>
                                </div>:
                                <span>Location: NA</span>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr />
            <div>
                <h3>Flight Tracking</h3>
                <table style={{width:'100%'}}>
                    <tbody>
                        <tr style={{"vertical-align":'top', display: 'inline-block'}}>
                            <td style={{width:'33%'}}>
                                <strong>Previous</strong> <br />
                                <span>Status: {f.tracking.previous.status ?? "NA"}</span><br/>
                                <span>Reason: {f.tracking.previous.reason ?? "NA"}</span><br/>
                                <span>Tics: {f.tracking.previous.tics ?? "NA"}</span><br/>
                                <span>Counter: {f.tracking.previous.counter ?? "NA"}</span><br/>
                                <span>Time: {new Date(f.tracking.previous.time ?? 0).toLocaleString()}</span><br/>
                                {f.tracking.previous.location != null ? 
                                <div>
                                    <span>Location: {f.tracking.previous.location.display_name ?? "NA"}</span><br/>
                                    <span>Type: {f.tracking.previous.location.type ?? "NA"}</span><br/>
                                    <span>Distance: {Math.round(f.tracking.previous.location.distance) ?? "NA"}</span><br/>
                                    <span>Zone: {f.tracking.current.location.zone ?? "NA"}</span><br/>
                                </div>:
                                <span>Location: NA</span>}
                            </td>
                            <td style={{width:'33%'}}>
                                <strong>Current</strong> <br/>
                                <span>Status: {f.tracking.current.status ?? "NA"}</span><br/>
                                <span>Reason: {f.tracking.current.reason ?? "NA"}</span><br/>
                                <span>Tics: {f.tracking.current.tics ?? "NA"}</span><br/>
                                <span>Counter: {f.tracking.current.counter ?? "NA"}</span><br/>
                                <span>Time: {new Date(f.tracking.current.time ?? 0).toLocaleString()}</span><br/>
                                {f.tracking.current.location != null ? 
                                <div>
                                    <span>Location: {f.tracking.current.location.display_name ?? "NA"}</span><br/>
                                    <span>Type: {f.tracking.current.location.type ?? "NA"}</span><br/>
                                    <span>Distance: {Math.round(f.tracking.current.location.distance) ?? "NA"}</span><br/>
                                    <span>Zone: {f.tracking.current.location.zone ?? "NA"}</span><br/>
                                </div>:
                                <span>Location: NA</span>}
                            </td>
                            <td style={{width:'33%'}}>
                                <strong>Next</strong> <br />
                                <span>Status: {f.tracking.next.status ?? "NA"}</span><br/>
                                <span>Reason: {f.tracking.next.reason ?? "NA"}</span><br/>
                                <span>Tics: {f.tracking.next.tics ?? "NA"}</span><br/>
                                <span>Counter: {f.tracking.next.counter ?? "NA"}</span><br/>
                                <span>Time: {new Date(f.tracking.next.time ?? 0).toLocaleString()}</span><br/>
                                {f.tracking.next.location != null ? 
                                <div>
                                    <span>Location: {f.tracking.next.location.display_name ?? "NA"}</span><br/>
                                    <span>Type: {f.tracking.next.location.type ?? "NA"}</span><br/>
                                    <span>Distance: {Math.round(f.tracking.next.location.distance) ?? "NA"}</span><br/>
                                    <span>Zone: {f.tracking.next.location.zone ?? "NA"}</span><br/>
                                </div>:
                                <span>Location: NA</span>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <hr />
            <div>
                <h3>FAA Registration</h3>
                <div>
                    <span>{f.faa["STREET"]} </span>
                    <span>{f.faa["STREET2"]} </span> <br />
                    {f.faa["STREET2"] != "" ? <div><span>{f.faa["STREET2"]} </span> <br /></div>: "" }
                    <span>{f.faa["CITY"]}, </span>
                    <span>{f.faa["STATE"]}, </span>
                    <span>{f.faa["ZIP CODE"]}, </span>
                    <span>{f.faa["COUNTRY"]} </span> <br />
                    <br />
                </div>

                <div>
                    <span>Type Registrant: {f.faa["TYPE REGISTRANT"]} </span>
                    <span>Type Aircraft: {f.faa["TYPE AIRCRAFT"]} </span>
                    <span>Type Engine: {f.faa["TYPE ENGINE"]}</span> <br />
                    <span>Manufacture year: {f.faa["YEAR MFR"]} </span>
                    <span>Serial number: {f.faa["SERIAL NUMBER"]} </span><br />
                </div>
            </div>
        </div>)
}

export default FlightSelected;