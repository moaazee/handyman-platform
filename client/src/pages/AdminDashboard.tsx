import { useState, useEffect } from "react";
import { Container, Button, Table, Card } from "react-bootstrap";
import api from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string; // "customer", "provider", "admin"
}

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
}

interface Booking {
  id: number;
  customer: string;
  service: string;
  bookedAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error loading services", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings", err);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  const deleteService = async (id: number) => {
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service", err);
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchServices();
    fetchBookings();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Users Table */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>Users</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Button variant="danger" onClick={() => deleteUser(user.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Services Table */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>Services</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.title}</td>
                  <td>{service.category}</td>
                  <td>{service.description}</td>
                  <td>
                    <Button variant="danger" onClick={() => deleteService(service.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Bookings Table */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>Bookings</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Booked At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.customer}</td>
                  <td>{booking.service}</td>
                  <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                  <td>
                    <Button variant="danger" onClick={() => deleteBooking(booking.id)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
