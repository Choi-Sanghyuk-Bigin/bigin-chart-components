import { css } from '@emotion/react';

interface BaseCssProps {
  barGap: number;
}

const baseCss = ({ barGap }: BaseCssProps) => css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: ${barGap}px;
  overflow: hidden;
  .horizontal-barchart-bar {
    border-radius: 4px;
    font-size: 14px;
    padding: 8px 12px;
    line-height: 20px;
    overflow: visible;
    white-space: nowrap;
  }
`;

export default baseCss;
