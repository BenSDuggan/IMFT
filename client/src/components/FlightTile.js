import React from "react";

function FlightTile(props) {
    const timeString = (time) => {
        const d = new Date(time*1000);
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    }

    let meter_to_feet = (meter) => meter * 3.28084;

    const f = props.flight;
 
    return (
        <td className="flight-tile-row" key={f.icao24} onClick={() => props.selectFlight(f.icao24)}>
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



            <div>
                {f.tracking.current.status === "grounded" && f.tracking.current.location != null ? 
                <div>
                    <i className="fa-solid fa-hospital"></i> 
                    <span>{f.tracking.current.location.display_name}</span>
                </div> : ""}

                
                
            </div>
            <div>
                <span>Dist: {f.tracking.current.location != null ? Math.round(f.tracking.current.location.distance) : ""} </span>
                <span>Zone: {f.tracking.current.location != null ? f.tracking.current.location.zone : ""} </span>
                <span>Tics: {f.tracking.current.location != null ? f.tracking.current.tics : ""}</span>
                <span>Reason: {f.tracking.current.location != null ? f.tracking.current.reason : ""}</span>
            </div>
        </td>)
}

export default FlightTile;