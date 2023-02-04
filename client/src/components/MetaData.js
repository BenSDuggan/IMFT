import React from "react";

function MetaData(props) {

    let handelClick = (d) => {
        props.socket.emit('hf_action', d)
    }

    return (
        <div>
            <strong>{"name" in props.data ? props.data.name : ""}</strong>  <br />
            🎥
            🚅 {"interval" in props.data ? props.data.interval : ""} secs x {"speed" in props.data ? props.data.speed : ""} 
            💯 {"current_frame" in props.data ? props.data.current_frame : ""} / {"max_frame" in props.data ? props.data.max_frame : ""}
            ⏳ {"time" in props.data ? new Date(props.data.time*1000).toLocaleTimeString() : ""}
            <br />
            📡 
            <button onClick={() => handelClick({"action":"start", "value":null})}>Start</button>
            <button onClick={() => handelClick({"action":"stop", "value":null})}>Stop</button>
            <select id="speed" onChange={(event) => handelClick({"action":"speed", "value":event.target.value})}>
                <option value="1">x1</option>
                <option value="1.5">x1.5</option>
                <option value="2">x2</option>
                <option value="5">x5</option>
                <option value="10">x10</option>
                <option value="20">x20</option>
                <option value="50">x50</option>
                <option value="75">x75</option>
                <option value="100">x100</option>
                <option value="125">x125</option>
                <option value="150">x150</option>
                <option value="175">x175</option>
                <option value="200">x200</option>
            </select>
            <input type="number" id="metadata_select-frame" />
            <button onClick={() => handelClick({"action":"frame", "value":document.getElementById('metadata_select-frame').value})}>Select Frame</button>
            <br />
            <br />
        </div>
        )
}

export default MetaData;


