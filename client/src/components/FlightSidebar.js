import { v4 as uuidv4 } from 'uuid';

import FlightTile from './FlightTile.js'

function FlightSidebar(props) {
    // Single dimensional to 2 dimensional
    let dtodd = (d) => {
        let dd = [];
        for(let i=0;i<d.length;i++) {
            if(i%2==0) dd.push([]);
            dd[dd.length-1].push(d[i]);
        }
        return dd
    }

    let airborn = props.flights.filter(f => f.tracking.current.status == "airborn");
    let grounded = props.flights.filter(f => f.tracking.current.status == "grounded");
    let los = props.flights.filter(f => f.tracking.current.status == "los");

    let aairborn = dtodd(airborn);
    let ggrounded = dtodd(grounded);
    let llos = dtodd(los);

 
    return (
        <div id="all-flights">
            <h2>Airborn ({airborn.length})</h2>
            <table style={{width:'100%'}}>
                <tbody>
                {aairborn.map(f => 
                    <tr key={uuidv4()}>
                        {f.map(ff =><FlightTile key={ff.icao24} flight={ff}></FlightTile>)}
                    </tr>
                )}
                </tbody>
            </table>

            <h2>Grounded ({grounded.length})</h2>
            <table>
                <tbody>
                {ggrounded.map(f => 
                    <tr key={uuidv4()}>
                        {f.map(ff =><FlightTile key={ff.icao24} flight={ff}></FlightTile>)}
                    </tr>
                )}
                </tbody>
            </table>

            <h2>Loss of Signal ({los.length})</h2>
            <table>
                <tbody>
                {llos.map(f => 
                    <tr key={uuidv4()}>
                        {f.map(ff =><FlightTile key={ff.icao24} flight={ff}></FlightTile>)}
                    </tr>
                )}
                </tbody>
            </table>
        </div>)
}

export default FlightSidebar;