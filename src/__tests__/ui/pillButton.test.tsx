import { render, screen, fireEvent } from '@testing-library/react';
import PillButton from '../../ui/PillButton';
import * as React from 'react';

describe("Pill button component tests", () => {
  const callback = jest.fn().mockResolvedValue(true);

  test("Button renders without crashing", () => {
    render(<PillButton label='test' size='small' callback={callback} />);
    const button = screen.getByText('test');
    expect(button).toBeInTheDocument();
  });

  test("Button click is successful when not disabled", () => {
    render(<PillButton label='test' size='small' callback={callback} disabled={false} />);
    const button = screen.getByText('test');
    fireEvent.click(button);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("Button click is not successful when disabled", () => {
    render(<PillButton label='test' size='small' callback={callback} disabled={true} />);
    const button = screen.getByText('test');
    fireEvent.click(button);
    expect(callback).not.toHaveBeenCalledTimes(1);
  });
});