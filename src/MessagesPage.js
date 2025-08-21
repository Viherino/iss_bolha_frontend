import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';

function MessagesPage() {
  const { user, isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchConversations();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.listingId, selectedConversation.otherUserId);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/message/conversations', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (listingId, otherUserId) => {
    try {
      const response = await fetch(`http://localhost:8000/message/conversation/${listingId}/${otherUserId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      
      // Mark messages as read when viewed
      markMessagesAsRead(listingId, otherUserId);
    } catch (err) {
      setError(err.message);
    }
  };

  const markMessagesAsRead = async (listingId, otherUserId) => {
    try {
      await fetch(`http://localhost:8000/message/mark-read/${listingId}/${otherUserId}`, {
        method: 'POST',
        credentials: 'include',
      });
      // Refresh conversations to update read status
      fetchConversations();
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await fetch('http://localhost:8000/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage,
          recipientId: selectedConversation.otherUserId,
          listingId: selectedConversation.listingId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      // Refresh messages and conversations
      fetchMessages(selectedConversation.listingId, selectedConversation.otherUserId);
      fetchConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (listingId, otherUserId) => {
    if (!window.confirm('Ali ste prepričani, da želite izbrisati celoten pogovor? Te akcije ni mogoče razveljaviti.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:8000/message/delete-conversation/${listingId}/${otherUserId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Clear selected conversation if it was the deleted one
      if (selectedConversation && 
          selectedConversation.listingId === listingId && 
          selectedConversation.otherUserId === otherUserId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      // Refresh conversations
      fetchConversations();
      setDeleteMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOtherUser = (conversation) => {
    return conversation.sender.id === user.id ? conversation.recipient : conversation.sender;
  };

  const getLatestMessage = (conversation) => {
    // Only show the message if it's from the other user, not the logged-in user
    if (conversation.sender.id === user.id) {
      return "Vi ste poslali sporočilo";
    }
    return conversation.content;
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center">
        <Alert variant="warning">Prosimo, prijavite se za ogled sporočil.</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p className="mt-2">Nalagam sporočila...</p>
      </div>
    );
  }

  return (
    <div className="h-100">
      <Card className="shadow-sm h-100">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Sporočila</h3>
          <Button 
            variant={deleteMode ? "danger" : "outline-danger"} 
            size="sm"
            onClick={() => setDeleteMode(!deleteMode)}
            disabled={deleting}
          >
            {deleteMode ? "Prekliči brisanje" : "Izbriši pogovor"}
          </Button>
        </Card.Header>
        <Card.Body className="p-0 h-100">
          <Row className="g-0 h-100">
            {/* Conversations List */}
            <Col md={4} className="border-end h-100">
              <div className="p-3 h-100 d-flex flex-column">
                <h5 className="mb-3">Pogovori</h5>
                {error && <Alert variant="danger" size="sm">{error}</Alert>}
                {conversations.length === 0 ? (
                  <p className="text-muted">Ni sporočil</p>
                ) : (
                  <ListGroup variant="flush" className="flex-grow-1">
                    {conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const isSelected = selectedConversation && 
                        selectedConversation.listingId === conversation.listing.id &&
                        selectedConversation.otherUserId === otherUser.id;
                      
                      return (
                        <ListGroup.Item
                          key={`${conversation.listing.id}-${otherUser.id}`}
                          action={!deleteMode}
                          onClick={() => {
                            if (deleteMode) {
                              deleteConversation(conversation.listing.id, otherUser.id);
                            } else {
                              setSelectedConversation({
                                listingId: conversation.listing.id,
                                otherUserId: otherUser.id,
                                listing: conversation.listing,
                                otherUser: otherUser,
                              });
                            }
                          }}
                          className={`d-flex justify-content-between align-items-start border-0 ${
                            isSelected ? 'bg-light' : ''
                          } ${deleteMode ? 'delete-mode' : ''}`}
                          style={{
                            backgroundColor: isSelected ? '#f8f9fa' : 'transparent',
                            borderLeft: isSelected ? '3px solid #6c757d' : '3px solid transparent',
                            cursor: deleteMode ? 'pointer' : 'default',
                            ...(deleteMode && {
                              backgroundColor: '#fff5f5',
                              border: '1px solid #fecaca',
                              borderRadius: '8px',
                              marginBottom: '4px'
                            })
                          }}
                        >
                          <div className="flex-grow-1">
                            <div className="fw-bold">{otherUser.username}</div>
                            <small className="text-muted">{conversation.listing.title}</small>
                            <div className="small text-truncate text-muted">{getLatestMessage(conversation)}</div>
                          </div>
                          <div className="d-flex align-items-center">
                            {!conversation.isRead && conversation.recipient.id === user.id && !deleteMode && (
                              <Badge bg="primary" className="ms-2">Nova</Badge>
                            )}
                            {deleteMode && (
                              <Badge bg="danger" className="ms-2">
                                {deleting ? <Spinner animation="border" size="sm" /> : "Izbriši"}
                              </Badge>
                            )}
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </div>
            </Col>

            {/* Messages Area */}
            <Col md={8} className="h-100 d-flex flex-column">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-3 border-bottom bg-white">
                    <h6 className="mb-1">{selectedConversation.otherUser.username}</h6>
                    <small className="text-muted">{selectedConversation.listing.title}</small>
                  </div>

                  {/* Messages */}
                  <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 ${message.sender.id === user.id ? 'text-end' : 'text-start'}`}
                      >
                        <div
                          className={`d-inline-block p-2 rounded ${
                            message.sender.id === user.id
                              ? 'bg-primary text-white'
                              : 'bg-light'
                          }`}
                          style={{ maxWidth: '70%' }}
                        >
                          <div>{message.content}</div>
                          <small className={`${message.sender.id === user.id ? 'text-white-50' : 'text-muted'}`}>
                            {formatDate(message.sentAt)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-top bg-white">
                    <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                      <Row className="g-2">
                        <Col>
                          <Form.Control
                            type="text"
                            placeholder="Vnesite sporočilo..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                          />
                        </Col>
                        <Col xs="auto">
                          <Button type="submit" disabled={!newMessage.trim() || sending}>
                            {sending ? <Spinner animation="border" size="sm" /> : 'Pošlji'}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                  <div className="text-center text-muted">
                    <p>Izberite pogovor za ogled sporočil</p>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default MessagesPage;
