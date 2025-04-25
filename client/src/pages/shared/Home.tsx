import { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import styles from '../../styles/Home.module.css'; // Import the CSS Module

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
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const { token, user } = useAuth(); // Use the user context to check if the user is logged in and their role

  const fetchServices = async () => {
    try {
      const res = await api.get('/services', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', // Add token if available
        },
      });
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1>Welcome to Handyman 🛠️</h1>
        <p>Your trusted platform for service bookings.</p>
        <a href="#services" className="btn btn-primary btn-lg mt-3">Browse Our Services</a>
      </div>

      <Container className="py-5" id="services">
        <h2 className="text-center mb-4">Browse Our Services</h2>

        <Row className="g-4">
          {services.map((service) => (
            <Col md={6} lg={4} key={service.id}>
              <Card className={`${styles.serviceCard} h-100 shadow-sm`}>
                {service.image && <Card.Img variant="top" src={service.image} />}
                <Card.Body>
                  <Card.Title className={styles.cardTitle}>{service.title}</Card.Title>
                  <Badge bg="secondary" className="mb-2">{service.category}</Badge>
                  <Card.Text>{service.description}</Card.Text>
                  <Card.Text className="text-muted">
                    Provided by {service.user.name}
                  </Card.Text>

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
    </div>
  );
}
