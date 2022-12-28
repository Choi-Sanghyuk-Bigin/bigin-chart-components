import { Theme } from '@emotion/react';

declare module '@emotion/react' {
  export interface ThemeColorScheme {
    [key: string]: string;
  }
  export interface Theme {
    colors: ThemeColorScheme;
  }
}

export const lightTheme: Theme = {
  colors: {
    // BRAND
    primary: '#006fff',
    primaryHover: '#0059d9',
    primaryPressed: '#004ec0',

    secondary01: '#3399FF',
    secondary02: '#0A0F32',
    secondary03: '#cc9966',

    // system
    warning: '#FFAB00',
    success: '#27C28A',
    error: '#E65C5C',

    // background
    bg1: '#ffffff',
    bg2: '#F9FAFB',
    bg3: '#EDF1F6',

    // text
    text01: '#3D4046',
    text02: '#53585f',
    text03: '#626871',
    textPlaceholder: '#9ea5af',
    textDisabled: '#99a0a9',

    // etc
    icon: '#7E8696',
    iconMiddle: '#CAD4E7',
    divider: '#DCE0E8',
    dim: 'rgba(0, 0, 0, .6)',
  },
};

export const darkTheme: Theme = {
  colors: {
    // BRAND
    primary: '#006fff',
    primaryHover: '#0059d9',
    primaryPressed: '#004ec0',

    secondary01: '#3399FF',
    secondary02: '#000A29',
    secondary03: '#cc9966',

    // system
    warning: '#FFAB00',
    success: '#27C28A',
    error: '#E65C5C',

    // backgroud
    bg1: '#17181c',
    bg2: '#212127',
    bg3: '#2a2e37',

    // txet
    text01: '#ffffff',
    text02: '#B2C0CB',
    text03: '#626871',
    textPlaceholder: '#737b86',
    textDisabled: '#99a0a9',

    // etc
    icon: '#ffffff',
    divider: '#424448',
    dim: 'rgba(0, 0, 0, .6)',
  },
};

export const chartColors: string[] = [
  '#385dff',
  '#00abba',
  '#ffbf00',
  '#8f33ff',
  '#ff6e26',
  '#d6337f',
  '#a6a621',
  '#804646',

  '#5d7afc',
  '#30b9c5',
  '#fcc930',
  '#a259fc',
  '#fc884f',
  '#db5996',
  '#b5b54b',
  '#966868',

  '#8399fa',
  '#61c7d1',
  '#fad461',
  '#b780fa',
  '#faa378',
  '#e280ad',
  '#c4c475',
  '#ae8b8b',

  '#a7b6f7',
  '#91d5db',
  '#f7de91',
  '#caa5f7',
  '#f7bda0',
  '#e7a6c4',
  '#d3d39e',
  '#c4adad',

  '#cdd5f5',
  '#c2e4e7',
  '#f5e8c2',
  '#dfccf5',
  '#f5d8ca',
  '#edccdb',
  '#e3e3c9',
  '#dcd0d0',
];
