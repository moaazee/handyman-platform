import { useState, useEffect } from "react";
import { Container, Button, Table, Card } from "react-bootstrap";
import api from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Booking {
  id: number;
  customer: string;
  bookedAt: string;
  price: number;
  status: string;
  user: {
    name: string;
    email: string;
  };
  service: {
    title: string;
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings", err);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  const deleteBooking = async (id: number) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking", err);
    }
  };

  useEffect(() => {
    fetchUsers();
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
                    <Button variant="danger" size="sm" onClick={() => deleteUser(user.id)}>
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
          <h4>All Bookings</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Booked At</th>
                <th>Price</th>
                <th>User (email)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.customer}</td>
                  <td>{booking.service.title}</td>
                  <td>
                    <strong
                      className={
                        booking.status === "cancelled" ? "text-danger" : "text-success"
                      }
                    >
                      {booking.status}
                    </strong>
                  </td>
                  <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                  <td>DKK {booking.price.toFixed(2)}</td>
                  <td>
                    {booking.user.name} ({booking.user.email})
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deleteBooking(booking.id)}>
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
