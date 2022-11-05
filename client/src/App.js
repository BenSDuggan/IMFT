import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import Sidebar from './components/Sidebar';
import Map from './components/Map';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const socket = io();

    // Getters
    socket.emit("get_hospitals", {});
    

    // Responders
    socket.on('hospitals', (data) => {
      setHospitals(data)
    })
      
    socket.on('nfd', (data) => {
      setFlights(data);
    });

    return () => socket.disconnect();
  }, []);

  return(
    <div className='main-container'>
      <Sidebar flights={flights}></Sidebar>
      <Map hospitals={hospitals} flights={flights}></Map>
    </div>
  )
}

export default App;
