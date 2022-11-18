import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import Sidebar from './components/Sidebar';
import Map from './components/Map';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    const socket = io();

    // Getters
    socket.emit("get_hospitals", {});
    

    // Responders
    socket.on('hospitals', (data) => {
      setHospitals(data)
    })
      
    socket.on('nfd', (data) => {
      setFlights(data.flights);
    });

    socket.on('hf_metadata', (data) => {
      setMetadata(data);
      console.log(data)
    });

    return () => socket.disconnect();
  }, []);

  return(
    <div className='main-container'>
      <Sidebar flights={flights} metadata={metadata}></Sidebar>
      <Map hospitals={hospitals} flights={flights}></Map>
    </div>
  )
}

export default App;
