import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PublisherDashboard from './PublisherDashboard';
import React from 'react';

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  return {
    Plus: () => <span>Plus</span>,
    Edit2: () => <span>Edit2</span>,
    Trash2: () => <span>Trash2</span>,
    Calendar: () => <span>Calendar</span>,
    FileUp: () => <span>FileUp</span>,
    Loader2: () => <span>Loader2</span>,
    CheckCircle2: () => <span>CheckCircle2</span>,
    AlertCircle: () => <span>AlertCircle</span>,
    Layout: () => <span>Layout</span>,
    Newspaper: () => <span>Newspaper</span>,
  };
});

describe('PublisherDashboard', () => {
  const mockUser = {
    id: 1,
    name: 'Test Publisher',
    email: 'test@example.com',
    role: 'publisher',
  };

  const mockMediaTitles = [
    {
      id: 1,
      publisher_id: 1,
      name: 'Test Magazine',
      contact: 'contact@test.com',
      default_price: 1000,
      default_reach: 5000,
      default_target_audience: 'Everyone',
      default_collaboration_type: 'Print',
    },
  ];

  beforeEach(() => {
    // Mock the window.scrollTo
    Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

    // Mock standard successful fetch responses
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/api/media-titles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMediaTitles),
        });
      }
      if (url.toString().includes('/api/publishers/1/topics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles error when saving a topic fails', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PublisherDashboard user={mockUser as any} onUserUpdate={vi.fn()} />
    );

    // Wait for the media titles to be loaded
    const titleRow = await screen.findByText('Test Magazine');

    // Click on the title to select it (opens the title view with topics)
    fireEvent.click(titleRow);

    // Now wait for the "Přidat téma ručně" button to appear
    const addTopicButton = await screen.findByText('Přidat téma ručně');

    // Open the add topic form
    fireEvent.click(addTopicButton);

    // Now the TopicForm is visible. Let's fill out required fields.
    // Use container.querySelector since there's no id/for mapping to labels in the component HTML
    await screen.findByText('Název tématu'); // Make sure form is rendered

    const textInputs = screen.getAllByRole('textbox');
    const titleInput = textInputs[0]; // Název tématu
    const descriptionInput = textInputs[1]; // Popis / Anotace

    const numberInputs = screen.getAllByRole('spinbutton');
    const reachInput = numberInputs[1]; // Dosah (0 is Price)

    // Hard to query without labels/roles/ids, let's use placeholder where available or DOM structure
    // Název tématu input
    fireEvent.change(titleInput, { target: { value: 'New Test Topic' } });

    // Popis
    fireEvent.change(descriptionInput, { target: { value: 'This is a description' } });

    // Reach
    fireEvent.change(reachInput, { target: { value: '1000' } });

    // Target audience (has placeholder)
    const targetAudienceInput = screen.getByPlaceholderText('např. B2B, IT manažeři');
    fireEvent.change(targetAudienceInput, { target: { value: 'B2B' } });

    // Contact (has placeholder)
    const contactInput = screen.getByPlaceholderText('např. redakce@magazin.cz');
    fireEvent.change(contactInput, { target: { value: 'test@example.com' } });

    // Date inputs
    const container = screen.getByText('Nové téma').closest('div');
    const dateInputs = container!.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2023-10-01' } }); // Publication
    fireEvent.change(dateInputs[1], { target: { value: '2023-09-15' } }); // Deadline

    // Mock fetch to simulate a network error during save
    const fetchMock = global.fetch as any;
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/topics') {
        return Promise.reject(new Error('Network error'));
      }
      // Fallback for any other calls during this test
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    // Submit the form
    const submitButton = screen.getAllByRole('button').find(b => b.textContent?.includes('Uložit') && b.getAttribute('type') === 'submit');
    if (submitButton) {
        fireEvent.click(submitButton);
    }

    // Verify that the error was caught and logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving topic:', expect.any(Error));
    });

    expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Network error');
  });
});