import React, { useState, useEffect } from 'react'; // Added useEffect
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CreateListingPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '', // Changed to category_id
    condition: '', // Added condition
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]); // State to store fetched categories
  const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('http://localhost:8000/category'); // Endpoint to get all categories
        if (!response.ok) {
          throw new Error('Failed to fetch categories.');
        }
        const data = await response.json();
        setCategories(data);
        setLoadingCategories(false);
      } catch (err) {
        setError(err.message || 'Error loading categories.');
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  const handleChange = (e) => {
    // For category_id, ensure it's stored as a number
    const value = e.target.name === 'category_id' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isLoggedIn || !user || !user.id) {
      setError('You must be logged in to create a listing.');
      return;
    }
    // Ensure a category is selected
    if (!formData.category_id) {
      setError('Please select a category.');
      return;
    }
    // Ensure a condition is selected
    if (!formData.condition) {
      setError('Please select the item condition.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id, // Associate the listing with the logged-in user
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing.');
      }

      setSuccess(true);
      setFormData({ title: '', description: '', price: '', category_id: '', condition: '' }); // Clear form
      // Optionally redirect after successful creation
      // navigate('/home'); 
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during listing creation.');
    }
  };

  if (!isLoggedIn) {
    return (
      <Container fluid className="px-md-5 my-5"> {/* Use fluid and reduced padding */}
        <Alert variant="warning">Za ustvarjanje oglasov se morate prijaviti.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-md-5 my-5"> {/* Use fluid and reduced padding */}
      <Card className="p-4 mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Objavi Oglas</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Oglas uspešno objavljen!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formListingTitle">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Naslov Oglasa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Vnesite naslov oglasa"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formListingDescription">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Opis</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Vnesite podroben opis oglasa"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formListingPrice">
                <Form.Label style={{ textAlign: 'left', display: 'block' }}>Cena (€)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Vnesite ceno"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formListingCategory">
                <Form.Label style={{ textAlign: 'left', display: 'block' }}>Kategorija</Form.Label>
                {loadingCategories ? (
                  <p>Nalagam kategorije...</p>
                ) : (
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Izberite kategorijo...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formListingCondition">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Stanje</Form.Label>
              <Form.Select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">Izberite stanje...</option>
                <option value="new">Novo</option>
                <option value="used">Rabljeno</option>
                <option value="refurbished">Obnovljeno</option>
              </Form.Select>
            </Form.Group>

            {/* Add more fields here if needed, e.g., for images */}

            <Button variant="primary" type="submit" className="w-100">
              Objavi Oglas
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreateListingPage;
