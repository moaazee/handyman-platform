import { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface JobRequest {
  id: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  location: string;
  deadline: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const { token } = useAuth();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Browse Job Requests</h2>

      <Row className="g-4">
        {jobs.map((job) => (
          <Col md={6} lg={4} key={job.id}>
            <Card className="h-100 shadow-sm">
              {job.image && <Card.Img variant="top" src={job.image} />}
              <Card.Body>
                <Card.Title>{job.title}</Card.Title>
                <Badge bg="secondary" className="mb-2">{job.category}</Badge>
                <Card.Text>{job.description}</Card.Text>
                <Card.Text><strong>Location:</strong> {job.location}</Card.Text>
                <Card.Text><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</Card.Text>
                <Card.Text className="text-muted">
                  Posted by {job.user.name} ({job.user.email})
                </Card.Text>
                <Button variant="primary" as="a" href={`/make-offer/${job.id}`}>
                  Make Offer
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
