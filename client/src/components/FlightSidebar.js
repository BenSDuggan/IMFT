import { v4 as uuidv4 } from 'uuid';

import FlightTile from './FlightTile.js'

function FlightSidebar(props) {
    let airborn = props.flights.filter(f => f.tracking.current.status == "airborn")
    let grounded = props.flights.filter(f => f.tracking.current.status == "grounded")
    let los = props.flights.filter(f => f.tracking.current.status == "los")
 
    return (
        <div id="all-flights">
            <h2>Airborn</h2>
            <table>
                {airborn.map(f => 
                    <FlightTile flight={f}></FlightTile>
                )}
            </table>

            <h2>Grounded</h2>
            <table>
                {grounded.map(f => 
                    <FlightTile flight={f}></FlightTile>
                )}
            </table>

            <h2>Loss of Signal</h2>
            <table>
                {los.map(f => 
                    <FlightTile flight={f}></FlightTile>
                )}
            </table>
        </div>)
}

export default FlightSidebar;