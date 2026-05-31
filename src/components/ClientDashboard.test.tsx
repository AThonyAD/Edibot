import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ClientDashboard from './ClientDashboard';
import { User } from '../types';

// Mock user
const mockUser: User = {
  id: 1,
  email: 'client@example.com',
  name: 'Client User',
  role: 'client'
};

// Mock topics
const mockTopics = [
  {
    id: 1,
    title: 'Test Topic 1',
    description: 'Description 1',
    media_name: 'Media 1',
    format: 'Print',
    collaboration_type: 'Placené PR',
    target_audience: 'B2B',
    reach: 10000,
    contact: 'contact1@example.com',
    publication_date: '2025-01-01',
    deadline_date: '2024-12-01',
    price: 5000,
    labels: ['business']
  },
  {
    id: 2,
    title: 'Test Topic 2',
    description: 'Description 2',
    media_name: 'Media 2',
    format: 'On-line',
    collaboration_type: 'Redakční obsah',
    target_audience: 'B2C',
    reach: 20000,
    contact: 'contact2@example.com',
    publication_date: '2025-02-01',
    deadline_date: '2025-01-01',
    price: 0,
    labels: ['lifestyle']
  }
];

// Mock media titles
const mockMediaTitles = [
  { id: 1, name: 'Media 1', format: 'Print' },
  { id: 2, name: 'Media 2', format: 'On-line' }
];

describe('ClientDashboard', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.startsWith('/api/topics')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTopics)
        } as Response);
      }
      if (typeof url === 'string' && url.startsWith('/api/media-titles')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockMediaTitles)
        } as Response);
      }
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly and fetches data', async () => {
    render(<ClientDashboard user={mockUser} />);

    // Check initial render
    expect(screen.getByText('Vyhledávání témat')).toBeInTheDocument();

    // Check if fetch was called
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/topics'));
      expect(fetchMock).toHaveBeenCalledWith('/api/media-titles');
    });

    // Check if topics are rendered
    await waitFor(() => {
      expect(screen.getByText('Test Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Test Topic 2')).toBeInTheDocument();
    });
  });

  it('updates topics when filters change', async () => {
    render(<ClientDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test Topic 1')).toBeInTheDocument();
    });

    fetchMock.mockClear();

    // Change format filter
    const selects = screen.getAllByRole('combobox');
    const formatSelectElement = selects.find(s => s.querySelector('option[value="Print"]'));

    if (formatSelectElement) {
        fireEvent.change(formatSelectElement, { target: { value: 'Print' } });
    }

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('format=Print'));
    });
  });

  it('handles empty topics correctly', async () => {
    fetchMock.mockImplementation((url) => {
      if (typeof url === 'string' && url.startsWith('/api/topics')) {
        return Promise.resolve({
          json: () => Promise.resolve([])
        } as Response);
      }
      if (typeof url === 'string' && url.startsWith('/api/media-titles')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockMediaTitles)
        } as Response);
      }
      return Promise.reject(new Error('not found'));
    });

    render(<ClientDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Žádná témata neodpovídají vašemu hledání.')).toBeInTheDocument();
    });
  });

  it('handles export CSV', async () => {
    render(<ClientDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test Topic 1')).toBeInTheDocument();
    });

    const mockElement = {
        setAttribute: vi.fn(),
        click: vi.fn(),
    };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    const exportBtn = screen.getByText('Exportovat CSV');
    fireEvent.click(exportBtn);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', 'edicni_plany.csv');
    expect(mockElement.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
