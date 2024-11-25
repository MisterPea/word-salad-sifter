import type { Meta, StoryObj } from '@storybook/react';
import CircleIconButton from '../ui/CircleIconButton';
// import '../style/main.scss';

const meta: Meta<typeof CircleIconButton> = {
  title: 'Atoms/Circle Icon Button',
  component: CircleIconButton,
  argTypes: {
    type: {
      options: ['help','settings'],
      control: { type: 'inline-radio' },
    },
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof CircleIconButton>;

export const Help: Story = {
  args: {
    type: 'help',
  },
};

export const Settings: Story = {
  args: {
    type: 'settings',
  },
};
