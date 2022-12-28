import React from 'react';
import { Story, Meta } from '@storybook/react';

import moment from 'moment';

import { LineChart, LineChartProps, D3lineData, ChartLabel } from './LineChart';

export default {
  title: '03-Components/15-Calendar/BDSCalendar',
  component: LineChart,
} as Meta;

const Template: Story<LineChartProps> = (args) => (
  <div style={{ marginLeft: '350px' }}>
    <LineChart {...args} />
  </div>
);

export const UsageKorean = Template.bind({});

UsageKorean.args = {};
