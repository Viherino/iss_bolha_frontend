import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ContactPage from './ContactPage';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import UserProfilePage from './UserProfilePage'; // Import the new UserProfilePage
import CreateListingPage from './CreateListingPage'; // Import the new CreateListingPage
import ListingDetailPage from './ListingDetailPage'; // Import the new ListingDetailPage
import EditListingPage from './EditListingPage'; // Import the new EditListingPage
import AppNavbar from './components/AppNavbar'; // Import the new AppNavbar component
import './App.css';

function App() {

  return (
    <Router>
      <div className="App">
        <AppNavbar /> {/* Use the new AppNavbar component */}

        <main className="py-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Navigate replace to="/home" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<UserProfilePage />} /> {/* Add route for UserProfilePage */}
            <Route path="/create-listing" element={<CreateListingPage />} /> {/* Add route for CreateListingPage */}
            <Route path="/listing/:id" element={<ListingDetailPage />} /> {/* Add route for ListingDetailPage */}
            <Route path="/edit-listing/:id" element={<EditListingPage />} /> {/* Add route for EditListingPage */}
          </Routes>
        </main>

        <footer className="bg-light py-3 border-top mt-auto">
          <Container fluid className="px-md-5"> {/* Use fluid and reduced padding */}
            <Row className="align-items-center justify-content-between">
              <Col xs="auto">
                <Button as={Link} to="/kontakt" variant="link" className="text-dark text-decoration-none">Kontakt</Button>
              </Col>
              <Col xs="auto">
                <p className="mb-0 text-muted">&copy; 2025 Fake_Bolha d.o.o.</p>
              </Col>
            </Row>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;
