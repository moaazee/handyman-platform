import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import api from '../api/axios';
import { storage, ref, uploadBytesResumable, getDownloadURL } from '../firebaseConfig';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  userId: number;
}

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  serviceId: number;
  service: {
    title: string;
  };
}

export default function ProviderDashboard() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
  
    inputFile.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
  
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      setUploading(true);
      setProgress(0);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setForm((prev) => ({
            ...prev,
            image: downloadURL,
          }));
          setImagePreview(downloadURL); // optional preview
          setUploading(false);
          console.log("Uploaded image URL:", downloadURL);
        }
      );
    };
  
    inputFile.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/services', form);
      setServices(prev => [res.data, ...prev]);
      setForm({ title: '', category: '', description: '', image: '' });
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to submit service:', error);
      alert("You must be logged in as a provider to add services.");
    }
  };

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/bookings'),
      ]);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load provider dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const providerServiceIds = services.map((s) => s.id);
  const providerBookings = bookings.filter((b) =>
    providerServiceIds.includes(b.serviceId)
  );

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Provider Dashboard</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Service Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., Painting, Plumbing"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Image Upload</Form.Label>
          <Button variant="secondary" onClick={handleImageUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>

          {uploading && (
            <div className="mt-2">
              <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
            </div>
          )}

          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" width="200" className="rounded shadow-sm" />
            </div>
          )}
        </Form.Group>

        <div className="d-grid mt-4">
          <Button type="submit" variant="success">Add Service</Button>
        </div>
      </Form>

      <h4 className="mt-5 mb-3">Your Services</h4>
      <Row xs={1} md={2} lg={3} className="g-4">
        {services.map(service => (
          <Col key={service.id}>
            <Card className="h-100 shadow-sm">
              {service.image && <Card.Img variant="top" src={service.image} />}
              <Card.Body>
                <Card.Title>{service.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{service.category}</Card.Subtitle>
                <Card.Text>{service.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
