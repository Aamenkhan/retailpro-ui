import { render, screen } from '@testing-library/react';
import App from './App';

test('shows login screen when not logged in', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText(/Har dukandar ka alag data/i)).toBeInTheDocument();
});
