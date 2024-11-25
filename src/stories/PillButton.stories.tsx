import type { Meta, StoryObj } from '@storybook/react';
import PillButton from '../ui/PillButton';

const meta: Meta<typeof PillButton> = {
  title: 'Atoms/Pill Button',
  component: PillButton,
  argTypes: {
    type: {
      options: ['primary-dark', 'primary-green', 'secondary'],
      control: { type: 'inline-radio' },
    },
    size: {
      options: ['small', 'large'],
      control: { type: 'inline-radio' }
    }
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof PillButton>;

export const Primary: Story = {
  args: {
    label: 'Interaction Designer',
    type: 'primary-dark',
    disabled: false
    // isSelected: false,
    // type: 'text',
  },
};
