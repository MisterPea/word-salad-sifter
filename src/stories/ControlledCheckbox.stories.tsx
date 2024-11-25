import type { Meta, StoryObj } from '@storybook/react';
import ControlledCheckbox from '../ui/ControlledCheckbox';

const meta: Meta<typeof ControlledCheckbox> = {
  title: 'Atoms/Checkbox',
  component: ControlledCheckbox,
  argTypes: {
    // type: {
    //   options: ['primary-dark', 'primary-green', 'secondary'],
    //   control: { type: 'inline-radio' },
    // },
    // size: {
    //   options: ['small', 'large'],
    //   control: { type: 'inline-radio' }
    // }
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof ControlledCheckbox>;

export const Primary: Story = {
  args: {
    label: 'Auto-Open On Complete',
    checked: false
  },
};
