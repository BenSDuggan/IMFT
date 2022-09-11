import React, { useState, useEffect } from "react";

import Sidebar from './components/Sidebar';
import FlightMap from './components/FlightMap';

import './App.css';

function App() {

  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetch("hospitals.json")
      .then((response) => response.json())
      .then((data) => setHospitals(data))
      .catch((error) => console.error(error));
  });

  return(
    <div className='main-container'>
      <Sidebar ></Sidebar>
      <FlightMap hospitals={hospitals}></FlightMap>
    </div>
  )
}

export default App;
