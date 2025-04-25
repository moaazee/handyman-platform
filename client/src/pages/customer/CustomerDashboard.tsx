import { useEffect, useState } from "react";
import { Container, Card, Button, Alert, Row, Col, Badge, Collapse } from "react-bootstrap";
import api from "../../api/axios";
import { Link } from "react-router-dom";

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  rescheduledAt?: string;
  status: string;
  price: number;
  service: {
    title: string;
  } | null;
}

interface Job {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  deadline: string;
  createdAt: string;
  taken?: boolean;
  cancelled?: boolean;
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
  accepted?: boolean;
  locked?: boolean;
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offersMap, setOffersMap] = useState<{ [jobId: number]: Offer[] }>({});
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data.filter((b: Booking) => b.status !== "cancelled"));
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

      const filteredJobs = jobsRes.data.filter((job: Job) => {
        const acceptedOffer = offersByJob[job.id]?.find((o) => o.accepted);
        return !job.cancelled && !job.taken && !acceptedOffer;
      });

      setJobs(filteredJobs);
    } catch (err) {
      console.error("Failed to fetch jobs or offers", err);
    }
  };

  const toggleJob = (id: number) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const acceptOffer = async (offerId: number) => {
    try {
      const res = await api.post(`/offers/accept/${offerId}`);
      alert(res.data.message);
      fetchJobsAndOffers();
      fetchBookings();
    } catch (err) {
      alert("Failed to accept offer.");
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
              <Card.Title>{booking.service ? booking.service.title : "No Service Title"}</Card.Title>
              <Card.Text>
                Booked on <strong>{new Date(booking.bookedAt).toLocaleString()}</strong>
              </Card.Text>
              {booking.rescheduledAt && (
                <Card.Text>
                  Rescheduled at: <strong>{new Date(booking.rescheduledAt).toLocaleString()}</strong>
                </Card.Text>
              )}
              <Card.Text>
                Status: <strong className={booking.status === "cancelled" ? "text-danger" : "text-success"}>{booking.status}</strong>
              </Card.Text>
              <Card.Text>
                Final Price: <strong>DKK {booking.price.toFixed(2)}</strong>
              </Card.Text>

              {booking.status === "active" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelBooking(booking.id)}
                >
                  Cancel Booking
                </Button>
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
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title>{job.title}</Card.Title>
                    <Badge bg="info" className="mb-2">{job.category}</Badge>
                  </div>
                  <Link to={`/job/${job.id}/details`}>
                    <Button variant="outline-secondary" size="sm">
                      View & Edit
                    </Button>
                  </Link>
                </div>

                <Card.Text>{job.description}</Card.Text>
                <Card.Text><strong>Location:</strong> {job.location}</Card.Text>
                <Card.Text><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</Card.Text>
                <Card.Text className="text-muted">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </Card.Text>

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => toggleJob(job.id)}
                >
                  {expandedJobId === job.id ? "Hide Offers" : `View Offers (${offersMap[job.id]?.length || 0})`}
                </Button>

                <Collapse in={expandedJobId === job.id}>
                  <div className="mt-3">
                    {offersMap[job.id] && offersMap[job.id].length > 0 ? (
                      offersMap[job.id].map((offer) => (
                        <Card key={offer.id} className={`mb-2 ${offer.accepted ? 'border-success' : 'border-secondary'}`}>
                          <Card.Body>
                            <Card.Text><strong>{offer.provider.name}</strong></Card.Text>
                            <Card.Text>💬 {offer.message}</Card.Text>
                            <Card.Text>💰 DKK {offer.price}</Card.Text>
                            <Card.Text>📅 Available: {new Date(offer.available).toLocaleDateString()}</Card.Text>
                            {offer.accepted && <Badge bg="success">Accepted</Badge>}
                            {!offer.accepted && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => acceptOffer(offer.id)}
                                className="mt-2"
                              >
                                Accept Offer
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted">No offers yet.</p>
                    )}
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
