import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('handles general error when fetch throws', async () => {
    const onLoginMock = vi.fn();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<Login onLogin={onLoginMock} />);

    fireEvent.change(screen.getByPlaceholderText('login.email_placeholder'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('login.password_placeholder'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login.button_login/i }));

    await waitFor(() => {
      expect(screen.getByText('login.error_network')).toBeInTheDocument();
    });

    expect(onLoginMock).not.toHaveBeenCalled();
  });
});
