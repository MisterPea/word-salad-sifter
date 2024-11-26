import { render, screen, fireEvent } from '@testing-library/react';
import ControlledCheckbox from '../../ui/ControlledCheckbox';
import * as React from 'react';

describe("Controlled Checkbox Tests", () => {
  test("renders ControlledCheckbox without crashing", () => {
    render(<ControlledCheckbox handleChange={()=> {}} label='my checkbox'/>)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument();
  });

  test("renders ControlledCheckbox without checkmark", () => {
    render(<ControlledCheckbox handleChange={()=> {}} checked={false} label='my checkbox'/>)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute("aria-checked","false")
  });

  test("renders ControlledCheckbox with checkmark", () => {
    render(<ControlledCheckbox handleChange={()=> {}} checked label='my checkbox'/>)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute("aria-checked","true")
  });

  test("ControlledCheckbox registers a click",()=> {
    const clickHandler = jest.fn()
    render(<ControlledCheckbox handleChange={clickHandler} checked label='my checkbox'/>)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox);
    expect(clickHandler).toHaveBeenCalledTimes(1)
  })
});