import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import SiftAction, { SiftActionProps } from '../../ui/SiftAction';

describe("Tests for SiftAction component", () => {
  const mockHandleSiftClick = jest.fn();
  const mockAutoOpenToggle = jest.fn();

  const defaultProps: SiftActionProps = {
    readyToSift: false,
    handleSiftClick: mockHandleSiftClick,
    autoOpenToggle: mockAutoOpenToggle,
    isAutoOpen: false
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders PillButton and Checkbox components", () => {
    render(<SiftAction {...defaultProps} />);
    const mainButton = screen.getByText("Sift Some Word Salad");
    const checkBox = screen.getByLabelText("Auto-Open on Complete");
    expect(mainButton).toBeInTheDocument();
    expect(checkBox).toBeInTheDocument();
  });

  test('disables the PillButton when `readyToSift` is false', () => {
    render(<SiftAction {...defaultProps} />);
    const button = screen.getByText('Sift Some Word Salad');
    expect(button).toBeDisabled();
  });

  test('enables the PillButton when `readyToSift` is true', () => {
    render(<SiftAction {...defaultProps} readyToSift={true} />);
    const button = screen.getByText('Sift Some Word Salad');
    expect(button).not.toBeDisabled();
  });

  test('calls `handleSiftClick` when PillButton is clicked and `readyToSift` is true', () => {
    render(<SiftAction {...defaultProps} readyToSift={true} />);
    const button = screen.getByText('Sift Some Word Salad');
    fireEvent.click(button);
    expect(mockHandleSiftClick).toHaveBeenCalledTimes(1);
  });

  test('does not call `handleSiftClick` when PillButton is clicked and `readyToSift` is false', () => {
    render(<SiftAction {...defaultProps} />);
    const button = screen.getByText('Sift Some Word Salad');
    fireEvent.click(button);
    expect(mockHandleSiftClick).not.toHaveBeenCalled();
  });

  test('calls `autoOpenToggle` when the Checkbox is toggled', () => {
    render(<SiftAction {...defaultProps} />);
    const checkbox = screen.getByLabelText('Auto-Open on Complete');
    fireEvent.click(checkbox);
    expect(mockAutoOpenToggle).toHaveBeenCalledTimes(1);
  });

  test('reflects the `isAutoOpen` prop state in the Checkbox', () => {
    render(<SiftAction {...defaultProps} isAutoOpen={true} />);
    const checkbox = screen.getByLabelText('Auto-Open on Complete') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  test('reflects the `isAutoOpen` prop state in the Checkbox', () => {
    render(<SiftAction {...defaultProps} isAutoOpen={false} />);
    const checkboxTwo = screen.getByLabelText('Auto-Open on Complete') as HTMLInputElement;
    expect(checkboxTwo.checked).toBe(false);
  });
});