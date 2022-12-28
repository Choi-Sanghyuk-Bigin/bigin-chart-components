import { css } from '@emotion/react';

const baseCss = css`
  .axis_y {
    > .domain {
      display: none;
    }
    text {
      font-size: 12px;
    }
  }

  .axis_x {
    > .domain {
      display: none;
    }
    text {
      font-size: 12px;
    }
  }

  .grid {
    .tick {
      line {
        stroke: #dce0e8;
      }
    }
    path {
      display: none;
    }
  }
`;

export default baseCss;
