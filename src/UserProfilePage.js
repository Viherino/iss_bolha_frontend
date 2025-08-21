import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Spinner, Tabs, Tab } from 'react-bootstrap'; // Added Tabs, Tab
import { useAuth } from './context/AuthContext'; // To get current user data
import { Link } from 'react-router-dom'; // Import Link for Moji Oglasi
import MessagesPage from './MessagesPage'; // Import MessagesPage

function UserProfilePage() {
  const { user, isLoggedIn } = useAuth(); // Get user and login status from context
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [userListings, setUserListings] = useState([]); // State for user's listings
  const [userListingsLoading, setUserListingsLoading] = useState(true); // Loading state for user listings
  const [userListingsError, setUserListingsError] = useState(null); // Error state for user listings
  const [key, setKey] = useState('myListings'); // State for active tab key - changed default to myListings

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn && user && user.id) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8000/users/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for sending cookies
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user profile.');
          }

          const userData = await response.json();
          setFormData({
            username: userData.username || '',
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
          });
          setLoading(false);
        } catch (err) {
          setError(err.message || 'An unexpected error occurred while fetching profile.');
          setLoading(false);
        }
      } else {
        setLoading(false); // Not logged in, so no loading
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, user]); // Re-fetch if login status or user data changes

  // New useEffect to fetch user's listings
  useEffect(() => {
    const fetchUserListings = async () => {
      if (isLoggedIn && user && user.id) {
        try {
          setUserListingsLoading(true);
          const token = localStorage.getItem('accessToken'); // Assuming you store token in localStorage
          const response = await fetch('http://localhost:8000/listing/my-listings', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user listings.');
          }

          const listingsData = await response.json();
          setUserListings(listingsData);
          setUserListingsLoading(false);
        } catch (err) {
          setUserListingsError(err.message || 'An unexpected error occurred while fetching your listings.');
          setUserListingsLoading(false);
        }
      } else {
        setUserListingsLoading(false);
      }
    };

    fetchUserListings();
  }, [isLoggedIn, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      setSuccess(true);
      // Optionally re-fetch user data or update AuthContext if the response contains updated user info
      // You might want to update the 'user' object in AuthContext with the 'userData' response
      // if your backend returns the updated user data without sensitive info.
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during profile update.');
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Ali ste prepričani, da želite izbrisati ta oglas?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/listing/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete listing.');
      }

      // Remove the deleted listing from the state
      setUserListings(userListings.filter(listing => listing.id !== listingId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during deletion.');
      setTimeout(() => setError(false), 3000); // Hide error message after 3 seconds
    }
  };

  if (!isLoggedIn) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">Prosimo, prijavite se za ogled vašega profila.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Nalagam profil...</p>
      </Container>
    );
  }

  // Create welcome message with user's name
  const welcomeMessage = formData.firstName && formData.lastName 
    ? `Dobrodošli ${formData.firstName} ${formData.lastName}`
    : 'Uporabniški Profil';

  return (
    <Container className="my-5">
      <Card className="p-4 mx-auto shadow-sm" style={{ maxWidth: '900px' }}> {/* Increased max-width for tabs */}
        <Card.Body>
          <h2 className="text-center mb-4">{welcomeMessage}</h2>
          
          <Tabs
            id="profile-listings-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3 justify-content-center"
          >
            <Tab eventKey="profile" title="Uredi Profil">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Profil uspešno posodobljen!</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formProfileUsername">
                    <Form.Label style={{ textAlign: 'left', display: 'block' }}>Uporabniško Ime</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Vnesite uporabniško ime"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formProfileFirstName">
                    <Form.Label style={{ textAlign: 'left', display: 'block' }}>Ime</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Vnesite vaše ime"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formProfileLastName">
                    <Form.Label style={{ textAlign: 'left', display: 'block' }}>Priimek</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Vnesite vaš priimek"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formProfileEmail">
                  <Form.Label style={{ textAlign: 'left', display: 'block' }}>Email Naslov</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Vnesite email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formProfilePhoneNumber">
                  <Form.Label style={{ textAlign: 'left', display: 'block' }}>Telefonska Številka (neobvezno)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Vnesite telefonsko številko"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formProfileAddress">
                  <Form.Label style={{ textAlign: 'left', display: 'block' }}>Naslov (neobvezno)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Vnesite naslov"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  Posodobi Profil
                </Button>
              </Form>
            </Tab>

            <Tab eventKey="myListings" title="Moji Oglasi">
              {userListingsLoading ? (
                <div className="text-center"><Spinner animation="border" size="sm" /> Nalagam oglase...</div>
              ) : userListingsError ? (
                <Alert variant="danger">{userListingsError}</Alert>
              ) : userListings.length === 0 ? (
                <Alert variant="info">Trenutno nimate objavljenih oglasov.</Alert>
              ) : (
                <Row className="g-3">
                  {userListings.map((listing) => (
                    <Col md={6} key={listing.id}>
                      <Card className="shadow-sm">
                        <Card.Body>
                          <Card.Title>{listing.title}</Card.Title>
                          <Card.Text>{listing.description}</Card.Text>
                          <Card.Text><strong>Cena:</strong> €{listing.price}</Card.Text>
                          <Card.Text><small className="text-muted">Status: {listing.status}</small></Card.Text>
                          <Button as={Link} to={`/edit-listing/${listing.id}`} variant="secondary" size="sm" className="me-2">Uredi</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(listing.id)}>Izbriši oglas</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>

            <Tab eventKey="messages" title="Sporočila">
              <MessagesPage />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UserProfilePage;
