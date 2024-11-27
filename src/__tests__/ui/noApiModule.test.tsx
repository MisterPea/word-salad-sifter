import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoApiModule from '../../ui/NoApiModule';
import { validateAnthropicApiKey } from '../../background/background_llmProcessing';
import { getSetAuth } from '../../background/background_auth';

// Mock the dependencies
jest.mock('../../background/background_llmProcessing', () => ({
  validateAnthropicApiKey: jest.fn(),
}));
jest.mock('../../background/background_auth', () => ({
  getSetAuth: jest.fn(),
}));

describe('NoApiModule', () => {
  const mockSetHasApiKey = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // This is to combat missing style issues
    const style = document.createElement('style');
    document.head.appendChild(style);
  });

  it('renders the component and its elements', () => {
    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);

    expect(screen.getByText(/Unartful Labs: Word Salad Sifter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Anthropic API Key\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeDisabled();
  });

  it('enables the submit button when the API key length is sufficient', () => {
    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);
    const input = screen.getByLabelText(/Anthropic API Key\*/i);
    const submitButton = screen.getByText(/Submit/i);

    fireEvent.change(input, { target: { value: 'validapikey123' } });
    expect(submitButton).toBeEnabled();
  });

  it('shows an error message if the API key validation fails', async () => {
    (validateAnthropicApiKey as jest.Mock).mockResolvedValue(false);

    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);
    const input = screen.getByLabelText(/Anthropic API Key\*/i);
    const submitButton = screen.getByText(/Submit/i);

    fireEvent.change(input, { target: { value: 'invalidkey' } });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText(/Invalid Anthropic API key/i)).toBeInTheDocument()
    );
  });

  it('handles successful API key validation and updates state', async () => {
    (validateAnthropicApiKey as jest.Mock).mockResolvedValue(true);

    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);
    const input = screen.getByLabelText(/Anthropic API Key\*/i);
    const submitButton = screen.getByText(/Submit/i);

    fireEvent.change(input, { target: { value: 'validapikey123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetHasApiKey).toHaveBeenCalledWith(true);
    });
  });

  it('displays a generic error message if validation throws an error', async () => {
    (validateAnthropicApiKey as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);
    const input = screen.getByLabelText(/Anthropic API Key\*/i);
    const submitButton = screen.getByText(/Submit/i);

    fireEvent.change(input, { target: { value: 'validapikey123' } });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText(/Error validating API key/i)).toBeInTheDocument()
    );
  });

  it('calls getSetAuth on mount', () => {
    render(<NoApiModule setHasApiKey={mockSetHasApiKey} />);

    expect(getSetAuth).toHaveBeenCalledTimes(1);
  });
});