import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function MakeOffer() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    message: '',
    price: '',
    available: '',
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/offers', {
        ...form,
        jobRequestId: jobId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Offer submitted!");
      navigate("/my-offers");
    } catch (err) {
      console.error("Offer failed:", err);
      alert("Failed to submit offer.");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Make an Offer</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Proposed Price (DKK)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Available Date</Form.Label>
          <Form.Control
            type="date"
            name="available"
            value={form.available}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary">Submit Offer</Button>
        </div>
      </Form>
    </Container>
  );
}
