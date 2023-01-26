import React, { useState, useEffect, useContext } from "react";

import Sidebar from './components/Sidebar';
import Map from './components/Map';
//import SocketContext from "./context/socket";

import io from 'socket.io-client';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);
  const [trips, setTrips] = useState([]);
  const [metadata, setMetadata] = useState({});  
  const [socket, setSocket] = useState(null);
  const [selectedSidebar, setSelectedSidebar] = useState({"tab":"flights", "id":null});

  let selectSidebar = (d) => {
      if(d == 'flights' || d == 'hospitals')
          setSelectedSidebar({"tab":d, "id":null});
      else
          setSelectedSidebar({"tab":"selected-flight", "id":d});
  }
  
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
      console.log(data);
      setFlights(data.flights);
      setTrips(data.trips);
    });

    s.on('hf_metadata', (data) => {
      setMetadata(data);
    });

    return () => s.disconnect();
  }, [setSocket]);

  return( 
    
      <div className='main-container'>
        <Sidebar flights={flights} trips={trips} metadata={metadata} socket={socket} selectedSidebar={selectedSidebar} setSelectedSidebar={selectSidebar}></Sidebar>
        <Map hospitals={hospitals} flights={flights} trips={trips} selectedSidebar={selectedSidebar} setSelectedSidebar={selectSidebar}></Map>
      </div>
    
  )
}

export default App;
//<SocketContext.Provider value={socket} >