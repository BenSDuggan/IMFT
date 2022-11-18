
import FlightSidebar from './FlightSidebar';
import MetaData from './MetaData';
import Metadata from './MetaData';

function Sidebar(props) {

    return (
        <div id="sidebar">
            {Object.keys(props.metadata).length > 0 ? <MetaData data={props.metadata}></MetaData> : <div></div>}
            <FlightSidebar flights={props.flights}></FlightSidebar>
        </div>
        )
}

export default Sidebar;