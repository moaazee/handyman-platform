import { useEffect, useState } from "react";
import { Container, Card, Button } from "react-bootstrap";
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

  const cancelBooking = async (id: number) => {
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Your Bookings</h2>

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
                Booked on <strong>{new Date(booking.bookedAt).toLocaleString()}</strong>
              </Card.Text>
              <Button variant="danger" size="sm" onClick={() => cancelBooking(booking.id)}>
                Cancel
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
