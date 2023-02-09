import React from "react";

import Container from 'react-bootstrap/container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Menu() {

  return( 
    <>
      <Navbar expand="md" bg="light" variant="light">
        <>
        <Navbar.Brand href="/">Indiana Medical Flight Tracking</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-navbar-nav" />
        <Navbar.Collapse id="menu-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Live</Nav.Link>
            <Nav.Link href="/trips">Trips</Nav.Link>
            <Nav.Link href="/hospitals">Hospital</Nav.Link>
            <Nav.Link href="/aircraft">Aircraft</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </>
    </Navbar>
    </>
  )
}

export default Menu;