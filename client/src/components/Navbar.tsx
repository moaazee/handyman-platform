import { Container, Nav, Navbar as BSNavbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <BSNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to="/">Handyman</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/services">Services</Nav.Link>
            <Nav.Link as={Link} to="/provider">Provider</Nav.Link>
            <Nav.Link as={Link} to="/book">Booking</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
