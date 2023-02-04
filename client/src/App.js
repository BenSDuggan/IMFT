import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Live from "./components/Live";
import Menu from './components/Menu'
import Trips from './components/Trips';
import Trip from './components/Trip.js';

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
      if(d === 'flights' || d == 'hospitals')
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

    s.on('db_trips', (data) => {
      console.log(data)
    })

    return () => s.disconnect();
  }, []);

  return( 
    <div>
      <Menu></Menu>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Live
              flights={flights}
              trips={trips}
              hospitals={hospitals}
              metadata={metadata}
              socket={socket}
              selectedSidebar={selectedSidebar}
              setSelectedSidebar={selectSidebar}>  
            </Live>
          } />
          <Route path="/trips" element={
            <Trips></Trips>} />
          <Route path="/hospitals" element={<h2>Hospitals</h2>} />
          <Route path="/aircraft" element={<h2>Aircraft</h2>} />
          <Route path="/trip/:tid" element={<Trip></Trip>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
//<SocketContext.Provider value={socket} >