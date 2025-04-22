import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

interface Service {
  id: number;
  title: string;
}

interface Booking {
  id: number;
  customer: string;
  serviceId: number;
  bookedAt: string;
  service: {
    title: string;
  };
}

export default function BookingForm() {
  const { token } = useAuth();

  const [form, setForm] = useState({ customer: "", serviceId: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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
      await axios.post("http://localhost:5000/api/bookings", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setForm({ customer: "", serviceId: "" });
      fetchBookings();
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  const fetchServices = async () => {
    const res = await axios.get("http://localhost:5000/api/services");
    setServices(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get("http://localhost:5000/api/bookings");
    setBookings(res.data);
  };

  const deleteBooking = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">Book a Service</h2>

      <Form onSubmit={handleSubmit} className="mb-5">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="customer"
                value={form.customer}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Select a Service</Form.Label>
              <Form.Select
                name="serviceId"
                value={form.serviceId}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid mt-4">
          <Button type="submit" variant="primary">
            Submit Booking
          </Button>
        </div>
      </Form>

      <h3>All Bookings</h3>
      {bookings.map((b) => (
        <Card key={b.id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>{b.customer}</Card.Title>
            <Card.Text>
              Booked <strong>{b.service.title}</strong> on{" "}
              {new Date(b.bookedAt).toLocaleString()}
            </Card.Text>
            <Button variant="danger" size="sm" onClick={() => deleteBooking(b.id)}>
              Delete
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
