import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap'; // Import Alert for error display
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { useAuth } from './context/AuthContext'; // Import useAuth

function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // New state for categories
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // New state for selected category

  const location = useLocation(); // Get current location
  const { user: loggedInUser } = useAuth(); // Get logged-in user from AuthContext

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(location.search); // Get query params from URL
        const searchQuery = queryParams.get('q'); // Get 'q' parameter

        let url = 'http://localhost:8000/listing';
        const params = new URLSearchParams();

        if (selectedCategoryId) {
          params.append('category', selectedCategoryId);
        }
        if (searchQuery) {
          params.append('q', searchQuery);
        }

        if (params.toString()) {
          url = `http://localhost:8000/listing/search?${params.toString()}`;
        }

        const response = await fetch(url); // Backend endpoint for all listings or search
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch listings.');
        }
        const data = await response.json();
        setListings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred while fetching listings.');
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedCategoryId, location.search]); // Re-fetch listings when selectedCategory or URL search changes

  useEffect(() => {
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
        setError(err.message || 'An unexpected error occurred while fetching categories.');
      }
    };
    fetchCategories();
  }, []); // Fetch categories only once on mount

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    // Clear search query when a category is selected
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.has('q')) {
      queryParams.delete('q');
      // This might not directly trigger a re-render if it's the same path
      // so we might need navigate to force it or rely on useEffect's location.search dependency
      window.history.replaceState({}, '', `${location.pathname}?${queryParams.toString()}`);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Nalagam oglase...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-md-5 my-5"> {/* Use fluid and reduced padding */}
      <h2 className="text-center mb-4">Vsi Oglasi</h2>

      <div className="category-filter-section mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        <Button
          variant={selectedCategoryId === null ? "primary" : "outline-primary"}
          onClick={() => handleCategoryClick(null)}
        >
          Vse Kategorije
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "primary" : "outline-primary"}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {listings.length === 0 ? (
        <Alert variant="info" className="text-center">Trenutno ni oglasov. Bodite prvi, ki boste objavili oglas!</Alert>
      ) : (
        <Row className="g-4">
          {listings.map((listing) => (
            <Col md={4} key={listing.id}>
              <Card className={`shadow-sm ${loggedInUser && listing.user && loggedInUser.id === listing.user.id ? 'my-listing-card' : ''}`}> {/* Conditionally add class */}
                {listing.images && listing.images.length > 0 ? (
                  <Card.Img variant="top" src={listing.images[0].imageUrl} style={{ height: '180px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '180px', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d' }}>No Image</div>
                )}
                <Card.Body>
                  <Card.Title>{listing.title}</Card.Title>
                  <Card.Text>{listing.description}</Card.Text>
                  <Card.Text><strong>Cena:</strong> €{listing.price}</Card.Text>
                  {listing.category && (
                    <Card.Text><small className="text-muted">Kategorija: {listing.category.name}</small></Card.Text>
                  )}
                  {listing.user && (
                    <Card.Text><small className="text-muted">Objavil: {listing.user.username}</small></Card.Text>
                  )}
                  <Button as={Link} to={`/listing/${listing.id}`} variant="primary" size="sm">Več informacij</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default HomePage;
