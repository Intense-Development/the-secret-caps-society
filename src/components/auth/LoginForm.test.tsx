import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock supabase browser client
jest.mock('@/lib/supabase/client', () => {
  return {
    supabaseBrowser: {
      auth: {
        signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  };
});

import { supabaseBrowser } from '@/lib/supabase/client';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('validates email and calls supabase signInWithOtp', async () => {
    render(<LoginForm />);

    const email = screen.getByLabelText(/email/i);
    const submit = screen.getByRole('button', { name: /send magic link/i });

    // invalid email
    await userEvent.type(email, 'invalid');
    await userEvent.click(submit);
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();

    // valid email
    await userEvent.clear(email);
    await userEvent.type(email, 'tester@example.com');
    await userEvent.click(submit);

    expect((supabaseBrowser.auth.signInWithOtp as jest.Mock)).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'tester@example.com', options: expect.any(Object) })
    );

    expect(await screen.findByRole('status')).toHaveTextContent(/check your email/i);
  });
});
