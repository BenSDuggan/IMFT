import React, { useState, useEffect, useContext } from "react";

import Sidebar from './components/Sidebar';
import Map from './components/Map';
//import SocketContext from "./context/socket";

import io from 'socket.io-client';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);
  const [metadata, setMetadata] = useState({});  
  const [socket, setSocket] = useState(null);

  //const s = useContext(SocketContext);
  
  
  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on("connect", () => {
      console.log("connected")
    });

    // Getters
    s.emit("get_hospitals", {});
    s.emit("get_flights", {});
    s.emit("get_hf_metadata", {});

    // Responders
    s.on('hospitals', (data) => {
      console.log(data)
      setHospitals(data)
    })
      
    s.on('nfd', (data) => {
      setFlights(data.flights);
      console.log(data)
    });

    s.on('hf_metadata', (data) => {
      setMetadata(data);
    });

    return () => s.disconnect();
  }, [setSocket]);

  return( 
    
      <div className='main-container'>
        <Sidebar flights={flights} metadata={metadata} socket={socket} ></Sidebar>
        <Map hospitals={hospitals} flights={flights}></Map>
      </div>
    
  )
}

export default App;
//<SocketContext.Provider value={socket} >