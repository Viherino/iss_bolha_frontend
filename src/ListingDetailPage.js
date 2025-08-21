import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { Spinner, Alert, Button, Modal, Form } from 'react-bootstrap'; // Import Button, Modal, Form
import { useAuth } from './context/AuthContext'; // Import useAuth

const ListingDetailPage = () => {
	const { id } = useParams();
	const { user: loggedInUser, isLoggedIn } = useAuth(); // Get logged-in user from AuthContext
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showContactModal, setShowContactModal] = useState(false);
	const [messageContent, setMessageContent] = useState('');
	const [sending, setSending] = useState(false);
	const [messageError, setMessageError] = useState(null);
	const [messageSuccess, setMessageSuccess] = useState(false);

	useEffect(() => {
		const fetchListing = async () => {
			try {
				const response = await fetch(`http://localhost:8000/listing/${id}`);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to fetch listing.');
				}
				const data = await response.json();
				setListing(data);
			} catch (err) {
				setError(err.message || 'An unexpected error occurred.');
			} finally {
				setLoading(false);
			}
		};

		fetchListing();
	}, [id]);

	const handleContactSeller = () => {
		if (!isLoggedIn) {
			alert('Prosimo, prijavite se za kontaktiranje prodajalca.');
			return;
		}
		setShowContactModal(true);
	};

	const handleSendMessage = async () => {
		if (!messageContent.trim() || !listing || !listing.user) return;
		try {
			setSending(true);
			setMessageError(null);
			const response = await fetch('http://localhost:8000/message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					content: messageContent,
					recipientId: listing.user.id,
					listingId: listing.id,
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to send message.');
			}
			setMessageSuccess(true);
			setMessageContent('');
			setTimeout(() => {
				setShowContactModal(false);
				setMessageSuccess(false);
			}, 1500);
		} catch (err) {
			setMessageError(err.message || 'Napaka pri pošiljanju sporočila.');
		} finally {
			setSending(false);
		}
	};

	if (loading) {
		return (
			<div className="listing-detail-page" style={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			</div>
		);
	}

	if (error) {
		return (
			<div className="listing-detail-page" style={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
				<Alert variant="danger">{error}</Alert>
			</div>
		);
	}

	if (!listing) {
		return (
			<div className="listing-detail-page" style={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
				<Alert variant="info">Listing not found.</Alert>
			</div>
		);
	}

	return (
		<>
			<div className="listing-detail-page shadow-sm">
				<div className="listing-content">
					{/* Image Placeholder - replace with actual image when available */}
					<div className="listing-image-placeholder" style={{ width: '100%', height: '300px', backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<h3>{listing.image_url ? <img src={listing.image_url} alt={listing.title} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'No Image Available'}</h3>
					</div>
					{/* Listing Details */}
					<div className="listing-details">
						<h2>{listing.title}</h2>
						<p><strong>Cena:</strong> €{listing.price}</p>
						<p><strong>Kategorija:</strong> {listing.category ? listing.category.name : 'N/A'}</p>
						<p><strong>Stanje:</strong> {listing.condition ? (listing.condition === 'new' ? 'Novo' : listing.condition === 'used' ? 'Rabljeno' : listing.condition === 'refurbished' ? 'Obnovljeno' : 'N/A') : 'N/A'}</p>
						<p><strong>Opis:</strong> {listing.description}</p>
					</div>
				</div>
				<div className="creator-info">
					<h3>O prodajalcu</h3>
					<p><strong>Prodajalec:</strong> {listing.user ? listing.user.username : 'N/A'}</p>
					{listing.user && listing.user.phoneNumber && (
						<p><strong>Telefonska številka:</strong> {listing.user.phoneNumber}</p>
					)}
					<p><strong>Kontaktni Email:</strong> {listing.user ? <a href={`mailto:${listing.user.email}`}>{listing.user.email}</a> : 'N/A'}</p>
					{listing.user && listing.user.address && (
						<p><strong>Lokacija:</strong> {listing.user.address}</p>
					)}
					
					{loggedInUser && listing.user && loggedInUser.id === listing.user.id ? (
						<Button as={Link} to={`/edit-listing/${listing.id}`} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Uredi Oglas</Button>
					) : (
						<Button onClick={handleContactSeller} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Kontaktiraj prodajalca</Button>
					)}
				</div>
			</div>

			{/* Contact Modal */}
			<Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Kontaktiraj prodajalca</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{messageError && <Alert variant="danger">{messageError}</Alert>}
					{messageSuccess && <Alert variant="success">Sporočilo uspešno poslano!</Alert>}
					<Form>
						<Form.Group>
							<Form.Label>Sporočilo za {listing.user?.username}</Form.Label>
							<Form.Control
								as="textarea"
								rows={4}
								value={messageContent}
								onChange={(e) => setMessageContent(e.target.value)}
								placeholder="Vnesite vaše sporočilo..."
								disabled={sending}
							/>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowContactModal(false)}>
						Prekliči
					</Button>
					<Button 
						variant="primary" 
						onClick={handleSendMessage}
						disabled={!messageContent.trim() || sending}
					>
						{sending ? <Spinner animation="border" size="sm" /> : 'Pošlji sporočilo'}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default ListingDetailPage;
