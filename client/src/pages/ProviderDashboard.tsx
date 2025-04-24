import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface JobRequest {
  id: number;
  title: string;
  location: string;
  deadline: string;
  user: {
    name: string;
  };
}

interface Offer {
  id: number;
  message: string;
  price: number;
  available: string;
  jobRequest: JobRequest;
}

export default function ProviderDashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/offers/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffers(res.data);
      } catch (err) {
        console.error("Failed to fetch offers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [token]);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">My Submitted Offers</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <p className="text-center">You haven’t made any offers yet.</p>
      ) : (
        <Row className="g-4">
          {offers.map((offer) => (
            <Col md={6} lg={4} key={offer.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{offer.jobRequest.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    📍 {offer.jobRequest.location}<br />
                    🗓 Deadline: {new Date(offer.jobRequest.deadline).toLocaleDateString()}
                  </Card.Subtitle>
                  <hr />
                  <Card.Text>
                    <strong>Message:</strong> {offer.message}<br />
                    💰 <strong>Price:</strong> DKK {offer.price.toFixed(2)}<br />
                    📅 <strong>Available:</strong> {new Date(offer.available).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-muted text-center">
                  👤 Posted by: {offer.jobRequest.user.name}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
