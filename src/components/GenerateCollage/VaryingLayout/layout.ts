export const gridSizes = [4, 5, 6]

export const COLLAGE_LAYOUTS = {
  4: {
    grid: { cols: 4, rows: 4 },
    sizes: [
      {
        type: 'medium',
        count: 2,
        size: 2,
        positions: {
          1: [
            { row: 0, col: 0 },
            { row: 2, col: 2 },
          ],
          2: [
            { row: 0, col: 2 },
            { row: 2, col: 0 },
          ],
        },
      },
      { type: 'small', count: 8, size: 1 },
    ],
    imageCount: 10,
  },

  5: {
    grid: { cols: 5, rows: 5 },
    sizes: [
      {
        type: 'large',
        count: 1,
        size: 3,
        positions: {
          1: [{ row: 0, col: 0 }],
          2: [{ row: 0, col: 2 }],
          3: [{ row: 2, col: 0 }],
        },
      },
      {
        type: 'medium',
        count: 2,
        size: 2,
        positions: {
          1: [
            { row: 0, col: 3 },
            { row: 3, col: 0 },
          ],
          2: [
            { row: 0, col: 0 },
            { row: 3, col: 3 },
          ],
          3: [
            { row: 0, col: 1 },
            { row: 3, col: 3 },
          ],
        },
      },
      { type: 'small', count: 8, size: 1 },
    ],
    imageCount: 11,
  },

  6: {
    grid: { cols: 6, rows: 6 },
    sizes: [
      {
        type: 'large',
        count: 2,
        size: 3,
        positions: {
          1: [
            { row: 0, col: 0 },
            { row: 0, col: 3 },
          ],
          2: [
            { row: 3, col: 0 },
            { row: 3, col: 3 },
          ],
          3: [
            { row: 0, col: 0 },
            { row: 3, col: 1 },
          ],
          4: [
            { row: 0, col: 3 },
            { row: 3, col: 2 },
          ],
        },
      },
      {
        type: 'medium',
        count: 3,
        size: 2,
        positions: {
          1: [
            { row: 3, col: 0 },
            { row: 3, col: 2 },
            { row: 3, col: 4 },
          ],
          2: [
            { row: 0, col: 0 },
            { row: 0, col: 2 },
            { row: 0, col: 4 },
          ],
          3: [
            { row: 0, col: 4 },
            { row: 2, col: 4 },
            { row: 4, col: 4 },
          ],
          4: [
            { row: 0, col: 0 },
            { row: 2, col: 0 },
            { row: 4, col: 0 },
          ],
        },
      },
      { type: 'small', count: 6, size: 1 },
    ],
    imageCount: 11,
  },
};