'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ImageItem {
  id: string;
  link: string;
  title: string;
  rank?: number;
}

interface CollageSettings {
  showName: boolean;
  containerWidth: number;
  containerHeight: number;
}

interface CollageGeneratorProps {
  items: ImageItem[];
  settings: CollageSettings;
  gridSize: number;
}

const DEFAULT_IMAGE =
  'https://via.placeholder.com/150/cccccc/969696?text=Image+Not+Found';

const COLLAGE_LAYOUTS = {
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

const CollageGenerator: React.FC<CollageGeneratorProps> = ({
  items,
  settings,
  gridSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  const printName = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    title: string
  ) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const textX = x + size / 2;
    const textY = y + size - 10;
    const textMetrics = ctx.measureText(title);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(
      textX - textMetrics.width / 2 - 5,
      textY - 14,
      textMetrics.width + 10,
      20
    );
    ctx.fillStyle = 'white';
    ctx.fillText(title, textX, textY);
  };

  useEffect(() => {
    const generateCollage = async () => {
      if (!canvasRef.current || !items.length) return;

      setLoading(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const layout = COLLAGE_LAYOUTS[gridSize as keyof typeof COLLAGE_LAYOUTS];

      const cellSize = Math.min(
        Math.floor(settings.containerWidth / layout.grid.cols),
        Math.floor(settings.containerHeight / layout.grid.rows)
      );

      canvas.width = layout.grid.cols * cellSize;
      canvas.height = layout.grid.rows * cellSize;

      const grid: boolean[][] = Array(layout.grid.rows)
        .fill(null)
        .map(() => Array(layout.grid.cols).fill(false));

      // choose variant key from first size with variants
      let variantKey: string | undefined;
      const firstWithVariants = layout.sizes.find(
        (s: any) => s.positions && !Array.isArray(s.positions)
      );
      if (firstWithVariants && firstWithVariants.positions) {
        const keys = Object.keys(firstWithVariants.positions);
        variantKey = keys[Math.floor(Math.random() * keys.length)];
      }

      const largeItems: any[] = [];
      const mediumItems: any[] = [];
      const smallItems: any[] = [];

      let currentIndex = 0;
      for (const sizeDef of layout.sizes) {
        let positions: any[] | undefined;
        if (sizeDef.positions) {
          if (Array.isArray(sizeDef.positions)) {
            positions = sizeDef.positions;
          } else if (variantKey) {
            positions = (sizeDef.positions as Record<string, any[]>)[variantKey];
          }
        }

        for (let i = 0; i < sizeDef.count && currentIndex < items.length; i++) {
          const assignment: any = {
            index: currentIndex,
            size: sizeDef.size,
          };

          if (positions && positions[i]) {
            assignment.position = positions[i];
          }

          if (sizeDef.size === 3) {
            largeItems.push(assignment);
          } else if (sizeDef.size === 2) {
            mediumItems.push(assignment);
          } else {
            smallItems.push(assignment);
          }
          currentIndex++;
        }
      }

      while (currentIndex < items.length) {
        smallItems.push({ index: currentIndex, size: 1 });
        currentIndex++;
      }

      // load+draw function
      const loadAndDrawImage = (
        assignment: any,
        item: ImageItem
      ): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            const squareSize = assignment.size;
            const position =
              assignment.position ||
              findAvailablePositionForSquare(
                grid,
                squareSize,
                layout.grid.cols,
                layout.grid.rows
              );

            if (!position) {
              console.warn(`No available position for ${squareSize}x${squareSize}`);
              resolve();
              return;
            }

            markCellsAsOccupied(grid, position.col, position.row, squareSize, squareSize);

            const x = position.col * cellSize;
            const y = position.row * cellSize;
            const drawSize = squareSize * cellSize;

            ctx.drawImage(img, x, y, drawSize, drawSize);

            if (settings.showName) {
              printName(ctx, x, y, drawSize, item.title);
            }

            resolve();
          };

          img.onerror = () => resolve();
          img.src = item.link || DEFAULT_IMAGE;
        });
      };

      // draw in phases
      for (const l of largeItems) await loadAndDrawImage(l, items[l.index]);
      for (const m of mediumItems) await loadAndDrawImage(m, items[m.index]);
      for (const s of smallItems) await loadAndDrawImage(s, items[s.index]);

      setLoading(false);
    };

    generateCollage();
  }, [items, settings, gridSize]);

  const findAvailablePositionForSquare = (
    grid: boolean[][],
    size: number,
    maxCol: number,
    maxRow: number
  ) => {
    for (let row = 0; row <= maxRow - size; row++) {
      for (let col = 0; col <= maxCol - size; col++) {
        if (
          canPlaceAtPosition(
            grid,
            col,
            row,
            size,
            size,
            maxCol,
            maxRow
          )
        ) {
          return { row, col };
        }
      }
    }
    return undefined;
  };

  const canPlaceAtPosition = (
    grid: boolean[][],
    col: number,
    row: number,
    width: number,
    height: number,
    maxCol: number,
    maxRow: number
  ) => {
    if (col + width > maxCol || row + height > maxRow) {
      return false;
    }
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        if (grid[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  const markCellsAsOccupied = (
    grid: boolean[][],
    col: number,
    row: number,
    width: number,
    height: number
  ) => {
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        if (r < grid.length && c < grid[0].length) {
          grid[r][c] = true;
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10,
          }}
        >
          <div>Generating collage...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={settings.containerWidth}
        height={settings.containerHeight}
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
};

const DemoCollage: React.FC = () => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [gridSize, setGridSize] = useState<number>(6);

  useEffect(() => {
    const imagesCount =
      COLLAGE_LAYOUTS[gridSize as keyof typeof COLLAGE_LAYOUTS]
        .imageCount || 10;
    const demoItems: ImageItem[] = Array.from({ length: imagesCount }, (_, i) => ({
      id: `item-${i}`,
      link: `https://picsum.photos/300/200?random=${i + 1}`,
      title: `Image ${i + 1}`,
      rank: Math.floor(Math.random() * 100),
    }));

    setItems(demoItems);
  }, [gridSize]);

  const settings: CollageSettings = {
    showName: true,
    containerWidth: 500,
    containerHeight: 500,
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Collage Generator (Predefined Layout)</h2>
      <p>Select grid size</p>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        <div>
          <label htmlFor="gridSize">Grid Size: </label>
          <select
            id="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
            <option value={6}>6x6</option>
          </select>
        </div>
      </div>
      <CollageGenerator items={items} settings={settings} gridSize={gridSize} />
    </div>
  );
};

export default DemoCollage;
