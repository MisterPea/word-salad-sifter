import { render, screen, fireEvent } from '@testing-library/react';
import CircleIconButton from '../../ui/CircleIconButton';
import * as React from 'react';

describe("CircleIconButton Tests", () => {
  test("renders CircleIconButton without crashing", () => {
    render(<CircleIconButton type="help" onClick={() => { }} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test("renders CircleIconButton with help icon", () => {
    render(<CircleIconButton type="help" onClick={() => { }} />);
    const helpIcon = screen.getByTestId("help-icon");
    expect(helpIcon).toBeInTheDocument();
  });

  test("renders CircleIconButton with settings icon", () => {
    render(<CircleIconButton type="settings" onClick={() => { }} />);
    const settingsIcon = screen.getByTestId("settings-icon");
    expect(settingsIcon).toBeInTheDocument();
  });

  test("calls onClick when CircleIconButton is clicked", () => {
    const handleClick = jest.fn();
    render(<CircleIconButton type="help" onClick={handleClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1)
  });
});