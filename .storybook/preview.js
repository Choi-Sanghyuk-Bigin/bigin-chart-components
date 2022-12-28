import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { addDecorator } from '@storybook/react';
import { themes } from '@storybook/theming';
import biginTheme from './biginTheme';
import { useDarkMode } from 'storybook-dark-mode';
import { lightTheme, darkTheme } from '../src/Theme';

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
  darkMode: {
    dark: { ...themes.dark },
    light: { ...biginTheme },
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    default: 'bgLightColor2',
    values: [
      {
        name: 'bgLightColor1',
        value: '#ffffff',
      },
      {
        name: 'bgLightColor2',
        value: '#F9FAFB',
      },
      {
        name: 'bgLightColor3',
        value: '#EDF1F6',
      },
      {
        name: 'bgDarkColor1',
        value: '#17181C',
      },
      {
        name: 'bgDarkColor2',
        value: '#212127',
      },
      {
        name: 'bgDarkColor3',
        value: '#2A2E37',
      },
      {
        name: 'white',
        value: '#ffffff',
      },
      {
        name: 'black',
        value: '#000000',
      },
    ],
  },
};

addDecorator((Story, { globals }) => {
  const thisTheme = lightTheme;
  return (
    <ThemeProvider theme={thisTheme}>
      <Story />
    </ThemeProvider>
  );
});
