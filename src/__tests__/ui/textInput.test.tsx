import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextInput from "../../ui/TextInput";

describe('TextInput Component', () => {
  const mockOnChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    // This is to combat missing style issues
    const style = document.createElement('style');
    document.head.appendChild(style);
  });

  test('renders the component with correct label and attributes', () => {
    render(
      <TextInput
        type="text"
        label="Username"
        onChange={mockOnChange}
        placeholder="Enter your username"
      />
    );

    const label = screen.getByText('Username');
    const input = screen.getByPlaceholderText('Enter your username');

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('id', 'username');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  test('triggers onChange when input value changes', () => {
    render(
      <TextInput
        type="text"
        label="Email"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('displays an error message when error prop is provided', () => {
    render(
      <TextInput
        type="password"
        label="Password"
        onChange={mockOnChange}
        error="Password is required"
      />
    );

    const error = screen.getByText('Password is required');

    expect(error).toBeInTheDocument();
    expect(error).toHaveClass('text_input-error_label');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows spinner when showSpinner is true', () => {
    render(
      <TextInput
        type="text"
        label="Loading Field"
        onChange={mockOnChange}
        showSpinner={true}
      />
    );

    const spinner = screen.getByTestId("material-spinner");
    expect(spinner).toBeInTheDocument();
  });

  test('hides spinner when showSpinner is false', () => {
    render(
      <TextInput
        type="text"
        label="No Loading"
        onChange={mockOnChange}
        showSpinner={false}
      />
    );

    const spinner = screen.queryByTestId('spinner');
    expect(spinner).not.toBeInTheDocument();
  });

  test('applies error-active class when error is present', () => {
    const { container } = render(
      <TextInput
        type="text"
        label="Error Field"
        onChange={mockOnChange}
        error="Error message"
      />
    );

    expect(container.firstChild).toHaveClass('text_input-wrapper error-active');
  });

  test('handles ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <TextInput
        type="text"
        label="Ref Test"
        onChange={mockOnChange}
        ref={ref}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});