import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useAuth } from './context/AuthContext'; // Import useAuth hook

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { login } = useAuth(); // Destructure login from useAuth hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await login(formData.email, formData.password);
      setSuccess(true);
      setFormData({ email: '', password: '' }); // Clear form
      navigate('/home');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    }
  };

  return (
    <Container fluid className="px-md-5 my-5"> {/* Use fluid and reduced padding */}
      <Card className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Prijava</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Prijava uspešna! Preusmerjam...</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
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

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Geslo</Form.Label>
              <Form.Control
                type="password"
                placeholder="Vnesite geslo"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Prijava
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
