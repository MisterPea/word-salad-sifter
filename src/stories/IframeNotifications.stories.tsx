import type { Meta, StoryObj } from '@storybook/react';
import IframeProcessPanelOverlay from '../ui/IframeProcessPanelOverlay';
import * as React from 'react';
import '../style/iframeStyle.css';

interface IframeProcessPanelOverlayProps {
  stage: 'zero' | 'one' | 'two' | 'three' | 'four' | 'error';
}

const meta: Meta<typeof IframeProcessPanelOverlay> = {
  title: 'Molecules/Process Overlay for iFrame',
  component: IframeProcessPanelOverlay,
  parameters: {
    layout: 'fullscreen',
    controls: {
      exclude: ['spinner', 'args']
    }
  },
  argTypes: {
    stage: {
      control: 'inline-radio',
      options: ['zero', 'one', 'two', 'three', 'four', 'hidden', 'error'],
    },
  },
};

export default meta;
const PageSimulator: React.FC<{ stage: IframeProcessPanelOverlayProps['stage']; }> = ({ stage }) => {
  return (
    <div style={{
      // margin: 0,
      height: '100%',
      width: '100%',
      display: 'flex',
      flex: '1 1 100%',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: 'rgb(245,245,245)'
    }}>
      <IframeProcessPanelOverlay stage={stage} />
    </div>
  );
};
type Story = StoryObj<typeof IframeProcessPanelOverlay>;

export const Primary: Story = {
  args: {
    stage: 'two',
  },
  render: (args) => <PageSimulator stage={args.stage} />,
};