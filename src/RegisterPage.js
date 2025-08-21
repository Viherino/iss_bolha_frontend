import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match!');
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setSuccess(true);
      setFormData({ username: '', email: '', password: '', passwordConfirm: '', firstName: '', lastName: '' });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <Container fluid className="px-md-5 my-5">
      <Card className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Registracija</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Registracija uspešna! Sedaj se lahko prijavite.</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
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

            <Form.Group className="mb-3" controlId="formBasicFirstName">
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

            <Form.Group className="mb-3" controlId="formBasicLastName">
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

            <Form.Group className="mb-3" controlId="formBasicPasswordConfirm">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Potrdi Geslo</Form.Label>
              <Form.Control
                type="password"
                placeholder="Potrdite geslo"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Registracija
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterPage;
