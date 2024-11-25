import type { Meta, StoryObj } from '@storybook/react';
import TemplateModule from '../ui/TemplateModule';
// import '../style/main.scss';

const meta: Meta<typeof TemplateModule> = {
  title: 'Molecules/Template Module',
  component: TemplateModule,
  argTypes: {
    // type: {
    //   options: ['text','password'],
    //   control: { type: 'inline-radio' },
    // },
    // width: {
    //   options: ['content', 'full'],
    //   control: { type: 'inline-radio' },
    // },
  },
};

export default meta;
type Story = StoryObj<typeof TemplateModule>;

export const Primary: Story = {
  args: {
    templates: [
      {
        templateId: 'abc',
        templateName: 'Interaction Designer'
      },
      {
        templateId: 'def',
        templateName: 'React/Redux Developer'
      },
      {
        templateId: 'ghi',
        templateName: 'Designer Developer'
      },
      {
        templateId: 'jkl',
        templateName: 'Frontend Developer'
      }
    ]
  },
};

export const EmptyTemplate: Story = {
  args: {
    templates: []
  },
};
