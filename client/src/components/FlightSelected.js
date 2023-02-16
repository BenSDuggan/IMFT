import React from "react";

import Table from 'react-bootstrap/Table';

let meter_to_feet = (meter) => meter * 3.28084;
const timeString = (time) => {
    const d = new Date(time*1000);
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
}

let FlightTable = (props) => {
    let f = props.flight;

    return (
        <Table className='' key={"table_"+props.status}>
            <thead>
                <tr>
                    <th><i className="fa-solid fa-tower-broadcast"></i></th>
                    <th>Time</th>
                    <th>Tics</th>
                    <th><i className="fa-solid fa-mountain-sun"></i></th>
                    <th><i className="fa-solid fa-gauge-high"></i></th>
                    <th><i className="fa-solid fa-arrow-trend-up"></i></th>
                    <th><i className="fa-regular fa-compass"></i></th>
                    <th><i className="fa-solid fa-location-crosshairs"></i></th>
                </tr>
            </thead>
            <tbody>
            <tr className=''>
                <td>{f.latest.squawk}</td>
                <td>{timeString(f.time)}</td>
                <td>{f.tics}</td>
                <td>{Math.round(meter_to_feet(f.latest.geo_altitude))}</td>
                <td>{ Math.round(meter_to_feet(f.latest.velocity))}</td>
                <td>{Math.round(meter_to_feet(f.latest.vertical_rate)) > 0 ? 
                    <i className="fa-solid fa-up-long"></i> :
                    Math.round(meter_to_feet(f.latest.vertical_rate)) < 0 ? 
                    <i className="fa-solid fa-down-long"></i> :
                    <i className="fa-solid fa-right-left"></i>}
                    <span> {Math.round(meter_to_feet(f.latest.vertical_rate))} </span>
                </td>
                <td>{Math.round(f.latest.track)}</td>
                <td><span>{f.latest.latitude}, {f.latest.longitude}</span></td>
            </tr>
            </tbody>
        </Table>
    )
}

let FlightTracking = (props) => {
    let f = props.flight;
    return (
        <>
        <h3>Flight Tracking</h3>
        <table style={{width:'100%'}}>
            <tbody>
                <tr style={{"verticalAlign":'top', display: 'inline-block'}}>
                    <td style={{width:'33%'}}>
                        <strong>Previous</strong> <br />
                        <span>Status: {f.tracking.previous.status ?? "NA"}</span><br/>
                        <span>Reason: {f.tracking.previous.reason ?? "NA"}</span><br/>
                        <span>Tics: {f.tracking.previous.tics ?? "NA"}</span><br/>
                        <span>Counter: {f.tracking.previous.counter ?? "NA"}</span><br/>
                        <span>Time: {new Date(f.tracking.previous.time*1000 ?? 0).toLocaleString()}</span><br/>
                        {f.tracking.previous.location !== null ? 
                        <div>
                            <span>Location: {f.tracking.previous.location.display_name ?? "NA"}</span><br/>
                            <span>Type: {f.tracking.previous.location.type ?? "NA"}</span><br/>
                            <span>Distance: {Math.round(f.tracking.previous.location.distance) ?? "NA"}</span><br/>
                            <span>Zone: {f.tracking.previous.location.zone ?? "NA"}</span><br/>
                        </div>:
                        <span>Location: NA</span>}
                    </td>
                    <td style={{width:'33%'}}>
                        <strong>Current</strong> <br/>
                        <span>Status: {f.tracking.current.status ?? "NA"}</span><br/>
                        <span>Reason: {f.tracking.current.reason ?? "NA"}</span><br/>
                        <span>Tics: {f.tracking.current.tics ?? "NA"}</span><br/>
                        <span>Counter: {f.tracking.current.counter ?? "NA"}</span><br/>
                        <span>Time: {new Date(f.tracking.current.time*1000 ?? 0).toLocaleString()}</span><br/>
                        {f.tracking.current.location !== null ? 
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
                        <span>Time: {new Date(f.tracking.next.time*1000 ?? 0).toLocaleString()}</span><br/>
                        {f.tracking.next.location !== null ? 
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
        </>
    )
}

function FlightSelected(props) {

    const flight = props.flight;
    const t = props.trip;
    let faa = {};
    let basic = {};

    if(flight === null || JSON.stringify(flight) === JSON.stringify({})) {
        faa = t.aircraft.faa ?? {};
        basic.display_name = t.aircraft.display_name;
        basic.icao24 = t.aircraft.aid;
        basic["N-NUMBER"] = t.aircraft["N-NUMBER"];
    }
    else {
        faa = flight.faa
        basic.display_name = flight.faa.NAME
        basic.icao24 = flight.icao24
        basic["N-NUMBER"] = flight.faa["N-NUMBER"]
    }
 
    return (
        <div key={basic.icao24}>
            <h3> {basic.display_name} <span>&#47;</span> <span>&#47;</span> {"N"+basic["N-NUMBER"]} ({basic.icao24})</h3>

            {flight !== null ? <FlightTable flight={flight}></FlightTable> : <></>}

            <div>
                <h3>Trip</h3>
                <span>Trip time: {(t.stats.time / 60).toFixed(1)} minutes  </span>  
                <span>Trip distance: {t.stats.distance.toFixed(2)} miles</span><br/>
                <table style={{width:'100%'}}>
                    <tbody>
                        <tr style={{"verticalAlign":'top', display: 'inline-block'}}>
                            <td style={{width:'50%'}}>
                                <strong>Departure</strong> <br />
                                <span>Time: {new Date(t.departure.time*1000 ?? 0).toLocaleString()}</span><br/>
                                <span>Location: {t.departure.display_name ?? "NA"}</span><br/>
                                <span>Type: {t.departure.type ?? "NA"}</span><br/>
                                <span>ID: {t.departure.lid ?? "NA"}</span><br/>
                                <span>Distance: {Math.round(t.departure.distance) ?? "NA"}</span><br/>
                                <span>Zone: {t.departure.zone ?? "NA"}</span><br/>
                            </td>
                            <td style={{width:'50%'}}>
                                <strong>Arrival</strong> <br />
                                <span>Time: {new Date(t.arrival.time*1000 ?? 0).toLocaleString()}</span><br/>
                                <span>Location: {t.arrival.display_name ?? "NA"}</span><br/>
                                <span>Type: {t.arrival.type ?? "NA"}</span><br/>
                                <span>ID: {t.arrival.lid ?? "NA"}</span><br/>
                                <span>Distance: {Math.round(t.arrival.distance) ?? "NA"}</span><br/>
                                <span>Zone: {t.arrival.zone ?? "NA"}</span><br/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {flight !== null ? <>
                <hr />
                <FlightTracking flight={flight}></FlightTracking>
            </> : <></>}

            {faa !== null && JSON.stringify(faa) !== JSON.stringify({}) ? <>
            <hr />
            <div>
                <h3>FAA Registration</h3>
                <div>
                    <span>{faa["STREET"]} </span>
                    <span>{faa["STREET2"]} </span> <br />
                    {faa["STREET2"] !== "" ? <div><span>{faa["STREET2"]} </span> <br /></div>: "" }
                    <span>{faa["CITY"]}, </span>
                    <span>{faa["STATE"]}, </span>
                    <span>{faa["ZIP CODE"]}, </span>
                    <span>{faa["COUNTRY"]} </span> <br />
                    <br />
                </div>

                <div>
                    <span>Type Registrant: {faa["TYPE REGISTRANT"]} </span>
                    <span>Type Aircraft: {faa["TYPE AIRCRAFT"]} </span>
                    <span>Type Engine: {faa["TYPE ENGINE"]}</span> <br />
                    <span>Manufacture year: {faa["YEAR MFR"]} </span>
                    <span>Serial number: {faa["SERIAL NUMBER"]} </span><br />
                </div>
            </div>
            </> : <></>}
        </div>)
}

export default FlightSelected;