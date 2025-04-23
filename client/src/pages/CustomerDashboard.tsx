import { useEffect, useState } from "react";
import { Container, Card, Button, Alert, Form } from "react-bootstrap";
import api from "../api/axios";

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  rescheduledAt?: string;
  status: string;
  price: number;
  service: {
    title: string;
  };
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState<{ [key: number]: string }>({});

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

  const cancelBooking = async (id: number) => {
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const rescheduleBooking = async (id: number) => {
    try {
      const newDate = rescheduleDate[id];
      if (!newDate) return alert("Please choose a new date.");

      await api.put(`/bookings/reschedule/${id}`, { newDate });
      fetchBookings();
    } catch (err) {
      console.error("Reschedule failed", err);
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
                Booked on <strong>{new Date(booking.bookedAt).toLocaleString()}</strong>
              </Card.Text>
              {booking.rescheduledAt && (
                <Card.Text>
                  Rescheduled at: <strong>{new Date(booking.rescheduledAt).toLocaleString()}</strong>
                </Card.Text>
              )}
              <Card.Text>
                Status:{" "}
                <strong className={booking.status === "cancelled" ? "text-danger" : "text-success"}>
                  {booking.status}
                </strong>
              </Card.Text>
              <Card.Text>
                Final Price: <strong>DKK {booking.price.toFixed(2)}</strong>
              </Card.Text>

              {booking.status === "active" && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Reschedule Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={rescheduleDate[booking.id] || ""}
                      onChange={(e) =>
                        setRescheduleDate((prev) => ({
                          ...prev,
                          [booking.id]: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => rescheduleBooking(booking.id)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
