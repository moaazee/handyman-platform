import { useEffect, useState } from "react";
import { Container, Card, Button, Alert, Form, Row, Col, Badge } from "react-bootstrap";
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

interface Job {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  deadline: string;
  createdAt: string;
}

interface Offer {
  id: number;
  message: string;
  price: number;
  available: string;
  provider: {
    name: string;
    email: string;
  };
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState<{ [key: number]: string }>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offersMap, setOffersMap] = useState<{ [jobId: number]: Offer[] }>({});

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

  const fetchJobsAndOffers = async () => {
    try {
      const jobsRes = await api.get("/jobs/me");
      setJobs(jobsRes.data);

      const offersByJob: { [jobId: number]: Offer[] } = {};
      await Promise.all(
        jobsRes.data.map(async (job: Job) => {
          try {
            const offerRes = await api.get(`/offers/job/${job.id}`);
            offersByJob[job.id] = offerRes.data;
          } catch (err) {
            console.error(`Failed to fetch offers for job ${job.id}`, err);
          }
        })
      );
      setOffersMap(offersByJob);
    } catch (err) {
      console.error("Failed to fetch posted jobs or offers", err);
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
    fetchJobsAndOffers();
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

      <hr className="my-5" />
      <h2 className="text-center mb-4">Your Posted Jobs</h2>
      <Row className="g-4">
        {jobs.map((job) => (
          <Col key={job.id} md={6} lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title>{job.title}</Card.Title>
                <Badge bg="info" className="mb-2">{job.category}</Badge>
                <Card.Text>{job.description}</Card.Text>
                <Card.Text><strong>Location:</strong> {job.location}</Card.Text>
                <Card.Text><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</Card.Text>
                <Card.Text className="text-muted">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </Card.Text>

                {offersMap[job.id] && offersMap[job.id].length > 0 && (
                  <>
                    <hr />
                    <strong>Offers:</strong>
                    {offersMap[job.id].map((offer) => (
                      <Card key={offer.id} className="mt-2 shadow-sm">
                        <Card.Body>
                          <Card.Text>
                            <strong>{offer.provider.name}</strong>
                          </Card.Text>
                          <Card.Text>💬 {offer.message}</Card.Text>
                          <Card.Text>💰 DKK {offer.price}</Card.Text>
                          <Card.Text>📅 Available: {new Date(offer.available).toLocaleDateString()}</Card.Text>
                        </Card.Body>
                      </Card>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
