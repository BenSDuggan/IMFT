import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import Sidebar from './components/Sidebar';
import Map from './components/Map';

import './App.css';



function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    // Getters
    s.emit("get_hospitals", {});

    // Responders
    s.on('hospitals', (data) => {
      console.log(data)
      setHospitals(data)
    })
      
    s.on('nfd', (data) => {
      setFlights(data.flights);
    });

    s.on('hf_metadata', (data) => {
      setMetadata(data);
      console.log(data)
    });

    return () => s.disconnect();
  }, []);

  let handelClick = (d) => {
    console.log(d)
    socket.emit('hf_action', d)
    socket.emit("get_hospitals", {});
  }
  

  return(
    <div className='main-container'>
      <Sidebar flights={flights} metadata={metadata} handelClick={handelClick}></Sidebar>
      <Map hospitals={hospitals} flights={flights}></Map>
    </div>
  )
}

export default App;
