import type { Preview } from "@storybook/react";
import '../src/style/mainStyle.scss';
import '../src/ui/ui_style/iframeProgress.scss';
import * as React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        style={{
          margin: 0,
          padding: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;