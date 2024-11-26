import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Footer from '../../ui/Footer';
import * as React from 'react';
import { validateAnthropicApiKey } from '../../background/background_llmProcessing';
import { logout } from '../../background/background_auth';
jest.mock('../../background/background_llmProcessing', () => ({
  validateAnthropicApiKey: jest.fn().mockResolvedValue(() => Promise.resolve()),
}));

jest.mock('../../background/background_auth', () => ({
  logout: jest.fn(),
}));

describe("Footer component tests", () => {
  const setHasApiKeyMock = jest.fn();

  // This is to combat missing style issues
  beforeEach(() => {
    const style = document.createElement('style');
    document.head.appendChild(style);
  });

  test("renders Footer component with help and setting buttons", () => {
    const { container } = render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={true} ref={null} />);
    const helpButton = screen.getByTestId('help-icon');
    const settingsButton = screen.getByTestId('settings-icon');
    expect(helpButton && settingsButton).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass("active", "inactive");
    expect(container.firstChild?.nextSibling).not.toHaveClass("active", "inactive");
  });

  test("opens API settings dialog when settings button is clicked", () => {
    const { container } = render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={true} ref={null} />);
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);
    const settingsPanel = screen.getByText(/Settings/i);
    const topText = screen.getByText(/In order to use this extension, you need to provide a valid Anthropic API Key./i);
    expect(settingsPanel && topText).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("active");
  });

  test("API key submission with valid key", async () => {
    const apiKey = 'very-long-but-valid-api-key';
    (validateAnthropicApiKey as jest.Mock).mockResolvedValue(true);
    render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={true} ref={null} />);

    // Open settings
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);

    // Input the API key and submit
    const apiInput = screen.getByLabelText(/Anthropic API Key/i);
    const submitButton = screen.getByTestId("api-submit-button");

    // Update input
    fireEvent.change(apiInput, { target: { value: apiKey } });
    fireEvent.click(submitButton);

    // Wait for asynchronous state updates
    await waitFor(() => {
      expect(validateAnthropicApiKey).toHaveBeenCalledWith(apiKey);
      expect(screen.queryByText(/Invalid Anthropic API key/i)).not.toBeInTheDocument();
    });
  });

  test("API key submission with invalid key", async () => {
    const apiKey = 'very-long-but-valid-api-key';
    (validateAnthropicApiKey as jest.Mock).mockResolvedValue(false);
    render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={true} ref={null} />);

    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);

    // Input the API key and submit
    const apiInput = screen.getByLabelText(/Anthropic API Key/i);
    const submitButton = screen.getByTestId("api-submit-button");

    // Update input
    fireEvent.change(apiInput, { target: { value: apiKey } });
    fireEvent.click(submitButton);

    // Wait for asynchronous state updates
    await waitFor(() => {
      expect(validateAnthropicApiKey).toHaveBeenCalledWith(apiKey);
      expect(screen.queryByText(/Invalid Anthropic API key/i)).toBeInTheDocument();
    });
  });

  test('signs out when button is clicked', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={true} ref={null} />);
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Are you sure you wish to do this?"));
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(setHasApiKeyMock).toHaveBeenCalledWith(false);
    });
  });

  test('closes dialog when cancel button is clicked', async () => {
    const { container } = render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={false} ref={null} />);
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);

    const cancelButton = screen.getByTestId("cancel-button-settings");
    fireEvent.click(cancelButton);
    expect(container.firstChild).toHaveClass('inactive');
  });

  test('opens help dialog when help button is clicked', () => {
    const { container } = render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={false} ref={null} />);
    const helpButton = screen.getByTestId('help-icon');
    fireEvent.click(helpButton);
    expect(container.firstChild?.nextSibling).toHaveClass('active');
  });

  test('closes help dialog when cancel button is clicked', () => {
    const { container } = render(<Footer setHasApiKey={setHasApiKeyMock} hasApiKey={false} ref={null} />);
    const helpButton = screen.getByTestId('help-icon');
    fireEvent.click(helpButton);
    expect(screen.getByText(/Help/i)).toBeInTheDocument();

    const cancelButton = screen.getByTestId("cancel-button-help");
    fireEvent.click(cancelButton);
    expect(container.firstChild?.nextSibling).toHaveClass('inactive');
  });
});
