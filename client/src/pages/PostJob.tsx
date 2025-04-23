import { useState } from 'react';
import { Container, Form, Button, Row, Col, ProgressBar, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { storage, ref, uploadBytesResumable, getDownloadURL } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';

export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    location: '',
    deadline: '',
  });

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = () => {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";

    inputFile.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const storageRef = ref(storage, `jobs/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploading(true);
      setProgress(0);
      setImagePreview(URL.createObjectURL(file));

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setForm((prev) => ({ ...prev, image: url }));
            setUploading(false);
          });
        }
      );
    };

    inputFile.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobs', form);
      alert('Job posted successfully!');
      navigate('/dashboard-customer'); // redirect or wherever you want
    } catch (error) {
      console.error('Failed to post job:', error);
      alert("Failed to post job. Make sure you're logged in as a customer.");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Post a Job Request</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control name="title" value={form.title} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control name="category" value={form.category} onChange={handleChange} placeholder="e.g. Painting, Electrical" required />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} rows={4} required />
        </Form.Group>

        <Row className="g-3 mt-1">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control name="location" value={form.location} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Deadline</Form.Label>
              <Form.Control type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Upload Image (optional)</Form.Label><br />
          <Button variant="secondary" onClick={handleImageUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          {uploading && (
            <div className="mt-2">
              <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
            </div>
          )}
          {imagePreview && !uploading && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" width="200" />
            </div>
          )}
        </Form.Group>

        <div className="d-grid mt-4">
          <Button type="submit" variant="primary">Submit Job</Button>
        </div>
      </Form>
    </Container>
  );
}
