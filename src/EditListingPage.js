import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    category_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]); // State to store categories

  useEffect(() => {
    // Fetch listing data
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8000/listing/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch listing for edit.');
        }

        const data = await response.json();
        setListingData({
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          category_id: data.category ? data.category.id : '',
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred while fetching listing.');
        setLoading(false);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/category');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch categories.');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message || 'Failed to load categories.');
      }
    };

    fetchListing();
    fetchCategories();
  }, [id]);

  const handleChange = (e) => {
    setListingData({ ...listingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/listing/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...listingData,
          price: parseFloat(listingData.price), // Ensure price is a number
          category_id: parseInt(listingData.category_id), // Ensure category_id is a number
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update listing.');
      }

      setSuccess(true);
      navigate(`/listing/${id}`); // Redirect to listing detail page after successful update
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during update.');
    }
  };

  if (loading) {
    return (
      <Container fluid className="px-md-5 my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Nalagam...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-md-5 my-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-md-5 my-5">
      <Card className="p-4 mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Uredi Oglas</h2>
          {success && <Alert variant="success">Oglas uspešno posodobljen!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Naslov</Form.Label>
              <Form.Control
                type="text"
                placeholder="Vnesite naslov oglasa"
                name="title"
                value={listingData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Opis</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Vnesite podroben opis oglasa"
                name="description"
                value={listingData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formPrice">
                <Form.Label style={{ textAlign: 'left', display: 'block' }}>Cena (€)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Vnesite ceno"
                  name="price"
                  value={listingData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formCategory">
                <Form.Label style={{ textAlign: 'left', display: 'block' }}>Kategorija</Form.Label>
                <Form.Select
                  name="category_id"
                  value={listingData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Izberi kategorijo...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formCondition">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Stanje</Form.Label>
              <Form.Select
                name="condition"
                value={listingData.condition}
                onChange={handleChange}
                required
              >
                <option value="">Izberi stanje...</option>
                <option value="new">Novo</option>
                <option value="used">Rabljeno</option>
                <option value="refurbished">Obnovljeno</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Posodobi Oglas
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditListingPage;
