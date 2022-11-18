

function MetaData(props) {

    return (
        <div>
            <strong>{"name" in props.data ? props.data.name : ""}</strong>  <br />
            🚅 {"interval" in props.data ? props.data.interval : ""} secs x {"speed" in props.data ? props.data.speed : ""} 
            💯 {"current_frame" in props.data ? props.data.current_frame : ""} / {"max_frame" in props.data ? props.data.max_frame : ""}
            ⏳ {"time" in props.data ? new Date(props.data.time*1000).toLocaleTimeString() : ""}
            <br />
        </div>
        )
}

export default MetaData;


