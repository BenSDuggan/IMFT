
import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';

function Sidebar(props) {

    return (
        <div id="sidebar">
            {Object.keys(props.metadata).length > 0 ? <MetaData data={props.metadata} socket={props.socket}></MetaData> : <div></div>}
            <FlightSidebar flights={props.flights}></FlightSidebar>
        </div>
        )
}

export default Sidebar;