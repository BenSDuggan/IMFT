import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import Sidebar from './components/Sidebar';
import Map from './components/Map';

import './App.css';


const socket = io();

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    fetch("hospitals.json")
      .then((response) => response.json())
      .then((data) => setHospitals(data))
      .catch((error) => console.error(error));
  
      socket.on('nfd', (data) => {
        setFlights(data);
      });
  });

  return(
    <div className='main-container'>
      <Sidebar flights={flights}></Sidebar>
      <Map hospitals={hospitals} flights={flights}></Map>
    </div>
  )
}

export default App;
