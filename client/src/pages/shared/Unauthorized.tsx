import { Container } from 'react-bootstrap';

export default function Unauthorized() {
  return (
    <Container className="py-5 text-center">
      <h2>Unauthorized</h2>
      <p>You do not have permission to view this page.</p>
    </Container>
  );
}