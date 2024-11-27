import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateButton from '../../ui/TemplateButton';

describe('TemplateButton Component', () => {
  const defaultProps = {
    label: 'Test Template',
    templateId: '12345',
    isSelected: false,
  };

  function extractClickData(event: React.SyntheticEvent) {
    const target = event.target as HTMLElement;
    const clickedTemplateName = target.getAttribute('data-template-name');
    const deleteTemplateName = target.getAttribute('data-template-name-delete');
    const dataTemplateId = target.getAttribute('data-template-id');
    return { clickedTemplateName, deleteTemplateName, dataTemplateId };
  }

  test('renders the component with correct props', () => {
    render(<TemplateButton {...defaultProps} />);
    const mainButton = screen.getByText(defaultProps.label);
    const deselectedCircle = screen.getByTestId("select-circle-icon");
    const deleteIcon = screen.getByTestId("remove-template-icon");
    expect(mainButton).not.toBeDisabled();
    expect(deselectedCircle).toBeInTheDocument();
    expect(deleteIcon).toBeInTheDocument();
  });

  test('renders the selected state properly', () => {
    render(<TemplateButton {...defaultProps} isSelected={true} />);
    const mainButton = screen.getByText(defaultProps.label);
    const selectedCheckmark = screen.getByTestId("select-check-icon");
    expect(mainButton).toBeDisabled();
    expect(selectedCheckmark).toBeInTheDocument();
  });

  test('it handles click/toggle event properly', () => {
    const handleParentClick = jest.fn((event) => {
      const { clickedTemplateName, deleteTemplateName, dataTemplateId } = extractClickData(event);
      return { clickedTemplateName, deleteTemplateName, dataTemplateId };
    });

    render(
      // We're using event delegation, hence the click handler outside the component
      <div onClick={handleParentClick}>
        <TemplateButton {...defaultProps} />
      </div>
    );

    const mainButton = screen.getByText(defaultProps.label).closest('button');
    fireEvent.click(mainButton!);

    expect(handleParentClick).toHaveBeenCalled();

    const extractedData = handleParentClick.mock.results[0].value;
    expect(extractedData).toEqual({
      clickedTemplateName: defaultProps.label,
      deleteTemplateName: null,
      dataTemplateId: defaultProps.templateId,
    });
  });

  test('it handles remove template event properly', () => {
    const handleParentClick = jest.fn((event) => {
      const { clickedTemplateName, deleteTemplateName, dataTemplateId } = extractClickData(event);
      return { clickedTemplateName, deleteTemplateName, dataTemplateId };
    });

    render(
      // We're using event delegation, hence the click handler outside the component
      <div onClick={handleParentClick}>
        <TemplateButton {...defaultProps} />
      </div>
    );

    const mainButton = screen.getByTestId("remove-template-icon").closest('button');
    fireEvent.click(mainButton!);

    expect(handleParentClick).toHaveBeenCalled();

    const extractedData = handleParentClick.mock.results[0].value;
    expect(extractedData).toEqual({
      clickedTemplateName: null,
      deleteTemplateName: defaultProps.label,
      dataTemplateId: defaultProps.templateId,
    });
  });

  test('handles accessibility attributes correctly', () => {
    render(<TemplateButton {...defaultProps} />);
    const templateContainer = screen.getByRole('switch');
    expect(templateContainer).toHaveAttribute('role', 'switch');
    expect(templateContainer).toHaveAttribute('data-template-name', defaultProps.label);
  });
});