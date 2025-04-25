import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

interface Offer {
  id: number;
  message: string;
  price: number;
  available: string;
  provider: {
    name: string;
    email: string;
  };
}

export default function ViewOffers() {
  const { jobId } = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await api.get(`/offers/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  };

  const acceptOffer = async (offerId: number) => {
    try {
      await api.post(`/offers/accept/${offerId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Offer accepted! Booking created.");
      navigate("/dashboard-customer");
    } catch (err) {
      console.error("Accept failed:", err);
      alert("Failed to accept offer.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Offers for Your Job</h2>

      <Row className="g-4">
        {offers.map((offer) => (
          <Col key={offer.id} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title>From {offer.provider.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{offer.provider.email}</Card.Subtitle>
                <Card.Text>{offer.message}</Card.Text>
                <Card.Text><strong>Price:</strong> DKK {offer.price}</Card.Text>
                <Card.Text><strong>Available:</strong> {new Date(offer.available).toLocaleDateString()}</Card.Text>
                <Button variant="success" onClick={() => acceptOffer(offer.id)}>Accept Offer</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
