import * as React from 'react';
import PillButton from './PillButton';
import Checkbox from './ControlledCheckbox';

interface SiftActionProps {
  readyToSift: boolean;
  handleSiftClick: () => void;
  autoOpenToggle: React.Dispatch<React.SetStateAction<boolean>>;
  isAutoOpen: boolean;
}

export default function SiftAction({ readyToSift, handleSiftClick, autoOpenToggle, isAutoOpen }: SiftActionProps) {

  const handleButtonClick = () => {
    if (readyToSift) handleSiftClick();
  };

  const handleAutoOpenToggle = () => {
    autoOpenToggle((s) => !s);
  };

  return (
    <div className="sift_action-wrapper">
      <div className="sift_action-action_button">
        <PillButton size="large" type="primary-dark" label="Sift Some Word Salad" disabled={!readyToSift} callback={handleButtonClick} />
      </div>
      <div className="sift_action-check_box">
        <Checkbox checked={isAutoOpen} handleChange={handleAutoOpenToggle} label="Auto-Open on Complete" />
      </div>
    </div>
  );
}