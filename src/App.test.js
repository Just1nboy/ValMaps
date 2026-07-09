import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Fabric.js needs a real 2D canvas context, which jsdom doesn't provide,
// so the canvas component is mocked for App-level tests.
jest.mock('./components/Canvas/StrategyCanvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => (
      <div data-testid="strategy-canvas" />
    )),
  };
});

test('renders the strategy planner shell', () => {
  render(<App />);
  expect(screen.getByText(/ValMaps/i)).toBeInTheDocument();
  expect(screen.getByText(/Tools/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Select Map/i)).toBeInTheDocument();
  expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();
});

test('shows the agent selector when the agent tool is chosen', () => {
  render(<App />);
  fireEvent.click(screen.getByTitle(/place the selected agent/i));
  expect(screen.getByText(/Select Agent/i)).toBeInTheDocument();
  // Jett appears in both the "Selected:" info box and the agent grid.
  expect(screen.getAllByText('Jett').length).toBeGreaterThan(0);
  expect(screen.getByTitle(/Sage \(Sentinel\)/i)).toBeInTheDocument();
});

test('shows the ability selector with the default agent kit', () => {
  render(<App />);
  fireEvent.click(screen.getByTitle(/place the selected ability/i));
  expect(screen.getByText(/Place Ability/i)).toBeInTheDocument();
  // Jett is the default agent, so her kit should be listed.
  expect(screen.getByText('Cloudburst')).toBeInTheDocument();
  expect(screen.getByText('Blade Storm')).toBeInTheDocument();
});
