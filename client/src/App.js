import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Aircraft from "./Aircraft";
import Hospitals from "./components/Hospitals";
import Live from "./components/Live";
import Menu from './components/Menu'
import Trip from './components/Trip.js';
import Trips from './components/Trips';

import io from 'socket.io-client';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);
  const [flights, setFlights] = useState([]);
  const [trips, setTrips] = useState([]);
  const [nfd, setNfd] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState({"tab":"flights", "id":null});

  let selectSidebar = (d) => {
      if(d === 'flights' || d === 'hospitals')
          setSelectedSidebar({"tab":d, "id":null});
      else
          setSelectedSidebar({"tab":"selected-flight", "id":d});
  }
  
  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on("connect", () => {
      console.log("connected")
      setConnected(true)
    });

    s.on("disconnect", () => {
      console.log("disconnected")
      setConnected(false)
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
      setNfd(data.nfd);
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
    <>
      <Menu connected={connected}></Menu>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Live
              flights={flights}
              trips={trips}
              nfd={nfd}
              hospitals={hospitals}
              metadata={metadata}
              socket={socket}
              selectedSidebar={selectedSidebar}
              setSelectedSidebar={selectSidebar}>  
            </Live>
          } />
          <Route path="/trips" element={
            <Trips></Trips>} />
          <Route path="/hospitals" element={<Hospitals></Hospitals>} />
          <Route path="/aircraft" element={<Aircraft></Aircraft>} />
          <Route path="/trip/:tid" element={<Trip></Trip>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
//<SocketContext.Provider value={socket} >