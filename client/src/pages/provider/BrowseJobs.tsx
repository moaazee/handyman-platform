import { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  user: {
    name: string;
    email: string;
  };
  jobRequest: {
    id: number;
    cancelled: boolean;
  };
}

export default function BrowseServices() {
  const [services, setServices] = useState<Service[]>([]);
  const { token, user } = useAuth(); // Use the user context to check if the user is logged in and their role

  // Fetch all services from the backend
  const fetchServices = async () => {
    try {
      const res = await api.get('/services', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', // Add token if available
        },
      });

      // Log the response to check the data structure
      console.log('Fetched services:', res.data);

      // Filter out services that have canceled job requests
      const validServices = res.data.filter((service: Service) => {
        console.log('Checking service cancellation status:', service.jobRequest.cancelled); // Log cancellation status
        return !service.jobRequest.cancelled;
      });

      setServices(validServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Browse Services</h2>

      <Row className="g-4">
        {services.map((service) => (
          <Col md={6} lg={4} key={service.id}>
            <Card className="h-100 shadow-sm">
              {service.image && <Card.Img variant="top" src={service.image} />}
              <Card.Body>
                <Card.Title>{service.title}</Card.Title>
                <Badge bg="secondary" className="mb-2">{service.category}</Badge>
                <Card.Text>{service.description}</Card.Text>
                <Card.Text className="text-muted">
                  Provided by {service.user.name}
                </Card.Text>

                {/* Only show the "Make Offer" button for logged-in providers */}
                {user ? (
                  user.role === 'provider' ? (
                    <Link to={`/make-offer/${service.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="primary">Make Offer</Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" disabled>
                      Login as provider to make an offer
                    </Button>
                  )
                ) : (
                  <Button variant="secondary" disabled>
                    Login to make an offer
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
