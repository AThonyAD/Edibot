import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import Login from './Login';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
}));

const mockOnLogin = vi.fn();

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('renders initial elements correctly', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByPlaceholderText('login.email_placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('login.password_placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login\.button_login/i })).toBeInTheDocument();
  });

  it('handles successful login correctly', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByPlaceholderText('login.email_placeholder');
    const passwordInput = screen.getByPlaceholderText('login.password_placeholder');
    const submitButton = screen.getByRole('button', { name: /login\.button_login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('handles failed login with error message', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText('login.email_placeholder'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('login.password_placeholder'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login\.button_login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('handles network errors properly', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText('login.email_placeholder'), { target: { value: 'error@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('login.password_placeholder'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login\.button_login/i }));

    await waitFor(() => {
      expect(screen.getByText('login.error_network')).toBeInTheDocument();
    });
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });
});
