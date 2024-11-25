import type { Meta, StoryObj } from '@storybook/react';
import TextInput from '../ui/TextInput';
// import '../style/main.scss';

const meta: Meta<typeof TextInput> = {
  title: 'Atoms/Text Input',
  component: TextInput,
  argTypes: {
    type: {
      options: ['text', 'password'],
      control: { type: 'inline-radio' },
    },
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Primary: Story = {
  args: {
    type: 'text',
    label: 'Google Doc URL*',
    placeholder:'https://docs.google.com/document/d/.../edit',
    error:'This Google Doc could not be found'
  },
};
