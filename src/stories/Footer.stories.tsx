import type { Meta, StoryObj } from '@storybook/react';
import Footer from '../ui/Footer';
import * as React from 'react';


const meta: Meta<typeof Footer> = {
  title: 'Molecules/Footer',
  component: Footer,
  parameters: {
    controls: {
      exclude: ['spinner', 'args']
    }
  }
};

export default meta;
const PageSimulator: React.FC = () => {
  return (
    <div style={{
      height: '100%',
      width:'100%',
      display:'flex',
      flexDirection:'column',
      justifyContent:'flex-end',
      marginTop:'-1rem',

    }}>
      <Footer />
    </div>
  );
};
type Story = StoryObj<typeof Footer>;

export const Primary: Story = {
  render: () => <PageSimulator />
};

