import { useEffect, useState } from "react";
import { Container, Card, Button, Badge, Alert } from "react-bootstrap";
import api from "../api/axios";

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  service: {
    title: string;
  };
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscount = async () => {
    try {
      const res = await api.get("/users/discount");
      setDiscount(res.data.discount);
    } catch (err) {
      console.error("Failed to fetch discount", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchDiscount();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Your Bookings</h2>

      {discount !== null && (
        <Alert variant="success" className="text-center">
          🎉 Your current subscription discount: <strong>{discount}%</strong>
        </Alert>
      )}

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>{booking.service.title}</Card.Title>
              <Card.Text>
                Booked on{" "}
                <strong>{new Date(booking.bookedAt).toLocaleString()}</strong>
              </Card.Text>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  // Cancel booking logic here
                }}
              >
                Cancel
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
