import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Form, FormControl } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppNavbar() {
  const { isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(`/home?q=${searchQuery}`);
      setSearchQuery(''); // Clear search input after navigating
    }
  };

  return (
    <header>
      {/* Main Navbar for Bolha, Search, Post Ad, and Auth buttons */}
      <Navbar bg="light" expand="lg" className="py-3 shadow-sm">
        <Container fluid className="px-md-5"> {/* Use fluid and reduced padding */}
          <Navbar.Brand as={Link} to="/home" className="fw-bold fs-4 text-dark me-4">Bolha</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar-nav" />
          <Navbar.Collapse id="main-navbar-nav">
            <Form className="d-flex flex-grow-1 mx-auto me-4">
              <FormControl
                type="search"
                placeholder="Kaj iščete danes?"
                className="flex-grow-1"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
              />
            </Form>
            <Nav className="ms-auto align-items-center"> {/* Added align-items-center for vertical alignment */}
              <Button as={Link} to="/create-listing" variant="outline-primary" className="me-2">Objava oglasa</Button>
              {isLoggedIn ? (
                <>
                  <Button as={Link} to="/profile" variant="link" className="text-dark text-decoration-none p-0 me-2">Moj Profil</Button>
                  <Button variant="link" className="text-dark text-decoration-none p-0" onClick={logout}>Odjava</Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="link" className="text-dark text-decoration-none p-0 me-2">Prijava</Button>
                  <Button as={Link} to="/register" variant="primary" size="sm">Registracija</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default AppNavbar;
