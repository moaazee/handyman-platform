import { Container, Nav, Navbar as BSNavbar, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to="/">Handyman</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {user?.role === "customer" && (
              <>
                <Nav.Link as={Link} to="/post-job">Post a Job</Nav.Link>
                <Nav.Link as={Link} to="/dashboard-customer">My Jobs</Nav.Link>
              </>
            )}

            {user?.role === "provider" && (
              <>
                <Nav.Link as={Link} to="/browse-jobs">Browse Jobs</Nav.Link>
                <Nav.Link as={Link} to="/provider">My Offers</Nav.Link>
              </>
            )}

            {user?.role === "admin" && (
              <Nav.Link as={Link} to="/admin-dashboard">Admin</Nav.Link>
            )}

            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link disabled>Hi, {user.name}</Nav.Link>
                <Button onClick={handleLogout} variant="outline-light" size="sm" className="ms-2">
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
