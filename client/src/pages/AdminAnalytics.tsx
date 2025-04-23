import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Spinner } from "react-bootstrap";
import api from "../api/axios";

interface Analytics {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  revenue: number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">📊 Admin Analytics</h2>

      {loading || !data ? (
        <Spinner animation="border" />
      ) : (
        <Row className="g-4">
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h5>Total Users</h5>
                <h3>{data.totalUsers}</h3>
                <small>Customers: {data.totalCustomers}, Providers: {data.totalProviders}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h5>Total Bookings</h5>
                <h3>{data.totalBookings}</h3>
                <small>Active: {data.activeBookings}, Cancelled: {data.cancelledBookings}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h5>Total Revenue</h5>
                <h3>DKK {data.revenue.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
