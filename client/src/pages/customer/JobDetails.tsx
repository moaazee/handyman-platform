import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

interface Job {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  deadline: string;
  createdAt: string;
  taken?: boolean;
}

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get<Job[]>(`/jobs/me`);
        const found = res.data.find((j) => j.id === parseInt(jobId || ""));
        if (found) setJob(found);
      } catch (err) {
        console.error("Error loading job", err);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleReschedule = async () => {
    if (!newDate) return alert("Please choose a date and time.");
    try {
      await api.put(`/jobs/reschedule/${jobId}`, { newDate });
      alert("Job deadline updated.");
    } catch (err) {
      alert("Failed to update deadline.");
    }
  };

  const handleUpdate = async () => {
    if (!job) return;
    try {
      await api.put(`/jobs/${jobId}`, {
        title: job.title,
        category: job.category,
        description: job.description,
        location: job.location,
        deadline: job.deadline,
      });
      alert("Job details updated!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update job.");
    }
  };

  if (!job) return <p>Loading...</p>;

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h3>Edit Job</h3>

        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={job.title}
            onChange={(e) => setJob({ ...job, title: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={job.category}
            onChange={(e) => setJob({ ...job, category: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={job.description}
            onChange={(e) => setJob({ ...job, description: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            value={job.location}
            onChange={(e) => setJob({ ...job, location: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Deadline</Form.Label>
          <Form.Control
            type="date"
            value={job.deadline.split("T")[0]}
            onChange={(e) => setJob({ ...job, deadline: e.target.value })}
          />
        </Form.Group>

        <h5 className="mt-4">✏️ Update Job Details</h5>
        <p className="text-muted mb-2">
          Use this to update the job title, description, category, location, or deadline.
        </p>
        <Button variant="primary" onClick={handleUpdate}>
          Update Job Details
        </Button>

        <hr className="my-4" />

        <h5>📅 Change Job Deadline</h5>
        <p className="text-muted mb-2">Pick a new date and time to reschedule the job.</p>
        <Form.Control
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <Button className="mt-2" variant="warning" onClick={handleReschedule}>
          Change Job Deadline
        </Button>

        <hr className="my-4" />

        <Button variant="secondary" onClick={() => navigate("/dashboard-customer")}>
          ← Back to My Jobs
        </Button>
      </Card>
    </Container>
  );
}
