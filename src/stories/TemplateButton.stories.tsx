import type { Meta, StoryObj } from '@storybook/react';
import TemplateButton from '../ui/TemplateButton';
// import '../style/main.scss';

const meta: Meta<typeof TemplateButton> = {
  title: 'Atoms/Template Button',
  component: TemplateButton,
  argTypes: {
    type: {
      // options: ['text','password'],
      // control: { type: 'inline-radio' },
    },
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof TemplateButton>;

export const Primary: Story = {
  args: {
    label: 'Interaction Designer',
    isSelected: false,
    // type: 'text',
  },
};
