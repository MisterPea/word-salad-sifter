import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SiftAction from '../ui/SiftAction';

const meta: Meta<typeof SiftAction> = {
  title: 'Molecules/Sift Action',
  component: SiftAction,
};

export default meta;
type Story = StoryObj<typeof SiftAction>;

// Create a wrapper component to use useState
const SiftActionWrapper = (args: React.ComponentProps<typeof SiftAction>) => {
  const [autoOpen, setIsAutoOpen] = useState(false);

  return (
    <SiftAction
      {...args}
      isAutoOpen={autoOpen}
      autoOpenToggle={() => setIsAutoOpen((s) => !s)}
    />
  );
};

export const Primary: Story = {
  render: (args) => <SiftActionWrapper {...args} />,
  args: {
    readyToSift: false,
    // Remove isAutoOpen and autoOpenToggle from here
    // label: 'Google Doc URL*',
    // placeholder:'https://docs.google.com/document/d/.../edit',
    // error:'This Google Doc could not be found'
  },
};