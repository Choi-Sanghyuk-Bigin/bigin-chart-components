import { css } from '@emotion/react';

const baseCss = css`
  .axis_y {
    > .domain {
      display: none;
    }
  }

  .axis_x {
    > .domain {
      display: none;
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
