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

export default function ProviderDashboard() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
  });

  const [services, setServices] = useState<Service[]>([]);
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

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Add a New Service</h2>

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
              <Form.Select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Painting">Painting</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
              </Form.Select>
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

      <h4 className="mt-5 mb-3">Added Services</h4>
      {loading ? (
        <div>Loading services...</div>
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
    </Container>
  );
}
