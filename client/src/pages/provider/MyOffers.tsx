import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

interface Offer {
  id: number;
  message: string;
  price: number;
  available: string;
  createdAt: string;
  jobRequest: {
    title: string;
    description: string;
    location: string;
    deadline: string;
    cancelled?: boolean;  // Track whether the job is cancelled
    user: {
      name: string;
    };
  } | null;
}

export default function MyOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const { token } = useAuth();

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out canceled jobs
      const validOffers = res.data.filter((offer: Offer) => offer.jobRequest && !offer.jobRequest.cancelled);
      setOffers(validOffers);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">My Submitted Offers</h2>
      {offers.length === 0 ? (
        <Alert variant="info" className="text-center">
          You haven’t submitted any active offers yet.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {offers.map((offer) => (
            <Col key={offer.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{offer.jobRequest?.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Posted by {offer.jobRequest?.user.name}
                  </Card.Subtitle>
                  <Card.Text>{offer.message}</Card.Text>
                  <Card.Text>
                    💰 <strong>DKK {offer.price}</strong>
                  </Card.Text>
                  <Card.Text>
                    📅 Available: {new Date(offer.available).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>
                    📌 Deadline: {offer.jobRequest?.deadline ? new Date(offer.jobRequest.deadline).toLocaleDateString() : "N/A"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
