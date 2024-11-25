import type { Meta, StoryObj } from '@storybook/react';
import PanelNotifications from '../ui/PanelNotifications';
import * as React from 'react';

interface PanelNotificationsProps {
  stage: 'zero' | 'one' | 'two' | 'three' | 'four' | 'error';
}

const meta: Meta<typeof PanelNotifications> = {
  title: 'Molecules/PanelNotifications',
  component: PanelNotifications,
  parameters: {
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
const PageSimulator: React.FC<{ stage: PanelNotificationsProps['stage']; }> = ({ stage }) => {
  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }}>
      <PanelNotifications stage={stage} />
    </div>
  );
};
type Story = StoryObj<typeof PanelNotifications>;

export const Primary: Story = {
  args: {
    stage: 'two',
  },
  render: (args) => <PageSimulator stage={args.stage} />,
};