import type { Meta, StoryObj } from '@storybook/react';
import MaterialSpinner from '../ui/MaterialSpinner';

const meta: Meta<typeof MaterialSpinner> = {
  title: 'Atoms/Spinner',
  component: MaterialSpinner,
  parameters: {
    controls: {
      exclude: ['spinner', 'args']
    }
  }
};

export default meta;
type Story = StoryObj<typeof MaterialSpinner>;

export const Primary: Story = {
  args: {
    radius: 18,
    strokeWidth: 4,
    rotationDuration: 900,
    pathAnimationDuration: 2400,
    pathLimits: { min: 0.01, max: 0.99 },
    staticPathLength: 0.10,
    showTrack: true,
    trackColor: '#edf3de',
    pathColor: '#3e884c',
  }
};

