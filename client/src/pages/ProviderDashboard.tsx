import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import api from '../api/axios';
import { storage, ref, uploadBytesResumable, getDownloadURL } from '../firebaseConfig'; // Correct import from firebaseConfig
import React, { MouseEvent } from 'react';

declare global {
  interface Window { cloudinary: any; }
}

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
  const [progress, setProgress] = useState(0); // Track upload progress
  const [uploading, setUploading] = useState(false); // Track if image is being uploaded
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Store image preview URL

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked");

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';

    inputFile.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]; // Get the file selected by the user
      if (file) {
        console.log("File selected:", file);

        // Set the preview URL of the image
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file); // Upload the file to Firebase Storage

        setUploading(true); // Start uploading

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress); // Update progress state
          },
          (error) => {
            console.error("Upload error:", error);
            setUploading(false); // Reset the uploading state
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              console.log("File uploaded, URL:", url);
              setForm((prev) => ({
                ...prev,
                image: url, // Store the image URL in the state
              }));
              setUploading(false); // Reset the uploading state
            });
          }
        );
      } else {
        console.log("No file selected");
      }
    };

    inputFile.click(); // Trigger the file input click
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/services', form);  // Send the service data to the back-end
      setServices(prev => [res.data, ...prev]);  // Add new service to the top
      setForm({ title: '', category: '', description: '', image: '' });  // Reset the form
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

  // Filter bookings only related to this provider's services
  const providerServiceIds = services.map((s) => s.id);
  const providerBookings = bookings.filter((b) =>
    providerServiceIds.includes(b.serviceId)
  );

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Provider Dashboard</h2>

      {/* Create Service Form */}
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
                placeholder="Enter service category (e.g., Painting, Flooring, etc.)"
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

          {/* Display the progress bar when uploading */}
          {uploading && (
            <div className="mt-2">
              <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
            </div>
          )}

          {/* Display the image preview after upload */}
          {imagePreview && !uploading && (
            <div className="mt-3">
              <img src={imagePreview} alt="Service Preview" width="200" />
            </div>
          )}
        </Form.Group>

        <div className="d-grid mt-4">
          <Button type="submit" variant="success">Add Service</Button>
        </div>
      </Form>

      {/* Services Display */}
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
