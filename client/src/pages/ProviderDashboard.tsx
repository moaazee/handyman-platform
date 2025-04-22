import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import api from '../api/axios';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  userId: number;
}

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  serviceId: number;
  service: {
    title: string;
  };
}

export default function ProviderDashboard() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/services', form);
      setServices(prev => [res.data, ...prev]);
      setForm({ title: '', category: '', description: '', image: '' });
    } catch (error) {
      console.error('Failed to submit service:', error);
      alert("You must be logged in as a provider to add services.");
    }
  };

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/bookings'),
      ]);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load provider dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter bookings only related to this provider's services
  const providerServiceIds = services.map((s) => s.id);
  const providerBookings = bookings.filter((b) =>
    providerServiceIds.includes(b.serviceId)
  );

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Provider Dashboard</h2>

      {/* Create Service Form */}
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Service Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter service category (e.g., Painting, Flooring, etc.)"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Image URL (optional)</Form.Label>
          <Form.Control
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="d-grid mt-4">
          <Button type="submit" variant="success">Add Service</Button>
        </div>
      </Form>

      {/* Services Display */}
      <h4 className="mt-5 mb-3">Your Services</h4>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {services.map(service => (
            <Col key={service.id}>
              <Card className="h-100 shadow-sm">
                {service.image && <Card.Img variant="top" src={service.image} />}
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{service.category}</Card.Subtitle>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Bookings Section */}
      <h4 className="mt-5 mb-3">Bookings for Your Services</h4>
      {providerBookings.length === 0 ? (
        <p>No bookings yet for your services.</p>
      ) : (
        providerBookings.map((b) => (
          <Card key={b.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>{b.service.title}</Card.Title>
              <Card.Text>
                Booked by <strong>{b.customer}</strong> on{" "}
                {new Date(b.bookedAt).toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
