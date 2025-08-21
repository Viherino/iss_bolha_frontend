import React from 'react';
import { Container } from 'react-bootstrap';

function ContactPage() {
  return (
    <Container fluid className="px-md-5 my-5">
      <div className="text-center">
        <h2 className="mb-4">Kontakt</h2>
        <p className="lead">
          Podpora za splošna vprašanja:{' '}
          <a href="mailto:bolha_support@gmail.com">bolha_support@gmail.com</a>
        </p>
      </div>
    </Container>
  );
}

export default ContactPage;


