import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelloCard } from './HelloCard';

describe('HelloCard', () => {
  it('renders greeting and increments counter', async () => {
    render(<HelloCard name="Tester" />);

    expect(screen.getByText('Hello, Tester!')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /increment/i });
    await userEvent.click(button);
    await userEvent.click(button);

    expect(button).toHaveTextContent('Clicked 2 times');
  });
});
