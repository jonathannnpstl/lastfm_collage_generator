"use client"

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
  gridSize: number
}

const DEFAULT_IMAGE =
  'https://via.placeholder.com/150/cccccc/969696?text=Image+Not+Found';

// *** Only 10-image layout ***
const COLLAGE_LAYOUTS = {
  4 : { 
    grid: { cols: 4, rows: 4 },
    sizes: [
      { type: 'large', count: 0, size: 3 }, // 3x3
      { type: 'medium', count: 2, size: 2 }, // 2x2
      { type: 'small', count: 8, size: 1 }, // 1x1
    ],
    imageCount: 10
  },
  5 : { 
    grid: { cols: 5, rows: 5 },
    sizes: [
      { type: 'large', count: 1, size: 3 }, // 3x3
      { type: 'medium', count: 2, size: 2 }, // 2x2
      { type: 'small', count: 8, size: 1 }, // 1x1
    ],
    imageCount: 11
  },
  6 : { 
    grid: { cols: 6, rows: 6 },
    sizes: [
      { type: 'large', count: 2, size: 3 }, // 3x3
      { type: 'medium', count: 3, size: 2 }, // 2x2
      { type: 'small', count: 6, size: 1 }, // 1x1
    ],
    imageCount: 11
  }
};

const CollageGenerator: React.FC<CollageGeneratorProps> = ({
  items,
  settings,
  gridSize
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

  const getDynamicLayout = (count: number) => {
  if (count <= 10) return COLLAGE_LAYOUTS[4];
  if (count <= 16) return COLLAGE_LAYOUTS[5];
  // if (count <= 34) return COLLAGE_LAYOUTS[34];
  // return COLLAGE_LAYOUTS[64];
};

  useEffect(() => {
  const generateCollage = async () => {
    if (!canvasRef.current || !items.length) return;

    setLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layout = COLLAGE_LAYOUTS[gridSize as keyof typeof COLLAGE_LAYOUTS] || getDynamicLayout(items.length);

    const cellSize = Math.min(
      Math.floor(settings.containerWidth / layout.grid.cols),
      Math.floor(settings.containerHeight / layout.grid.rows)
    );

    canvas.width = layout.grid.cols * cellSize;
    canvas.height = layout.grid.rows * cellSize;

    const grid: boolean[][] = Array(layout.grid.rows)
      .fill(null)
      .map(() => Array(layout.grid.cols).fill(false));

    // Separate large and small items without shuffle
    const largeItems: { index: number; size: number }[] = [];
    const mediumItems: { index: number; size: number }[] = [];
    const smallItems: { index: number; size: number }[] = [];

    let currentIndex = 0;
    for (const sizeDef of layout.sizes) {
      for (let i = 0; i < sizeDef.count && currentIndex < items.length; i++) {
        if (sizeDef.size === 3) {
          largeItems.push({ index: currentIndex, size: 3});
        } else if (sizeDef.size === 2) {
          mediumItems.push({ index: currentIndex, size: 2 });
        } else {
          smallItems.push({ index: currentIndex, size: 1 });
        }
        currentIndex++;
      }
    }
    while (currentIndex < items.length) {
      smallItems.push({ index: currentIndex, size: 1 });
      currentIndex++;
    }

    // Combine but keep large first
    const sizeAssignments = [...largeItems,...mediumItems, ...smallItems];

    const promises = sizeAssignments.map((assignment) => {
      return new Promise<void>((resolve) => {
        const idx = assignment.index;
        const squareSize = assignment.size;
        const item = items[idx];

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          // Find a spot for this size (deterministic order)
          const position = findAvailablePositionForSquare(
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

        img.onerror = () => {
          console.error('Failed to load image:', item.link);
          resolve();
        };

        img.src = item.link || DEFAULT_IMAGE;
      });
    });

    await Promise.all(promises);
    setLoading(false);
  };

  generateCollage();
}, [items, settings]);


  const findAvailablePositionForSquare = (
    grid: boolean[][],
    size: number,
    maxCol: number,
    maxRow: number
  ) => {
    const sizeCeil = Math.ceil(size);

    for (let row = 0; row <= maxRow - sizeCeil; row++) {
      for (let col = 0; col <= maxCol - sizeCeil; col++) {
        if (
          canPlaceAtPosition(grid, col, row, size, size, maxCol, maxRow)
        ) {
          return { row, col };
        }
      }
    }
    return null;
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
    if (col + Math.ceil(width) > maxCol || row + Math.ceil(height) > maxRow) {
      return false;
    }

    for (let r = row; r < row + Math.ceil(height); r++) {
      for (let c = col; c < col + Math.ceil(width); c++) {
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
    for (let r = row; r < row + Math.ceil(height); r++) {
      for (let c = col; c < col + Math.ceil(width); c++) {
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
  const [gridSize, setGridSize] = useState<number>(4)
  
  useEffect(() => {
    // Generate demo data based on selected count
    const imagesCount : number = COLLAGE_LAYOUTS[gridSize as keyof typeof COLLAGE_LAYOUTS].imageCount || 10 //fallback value
    const demoItems: ImageItem[] = Array.from({ length: imagesCount }, (_, i) => ({
      id: `item-${i}`,
      link: `https://picsum.photos/300/200?random=${i + 1}`,
      title: `Image ${i + 1}`,
      rank: Math.floor(Math.random() * 100)
    }));
    
    setItems(demoItems);
  }, [gridSize]);
  
  const settings: CollageSettings = {
    showName: true,
    containerWidth: 500,
    containerHeight: 500,
    // layout: 'balanced'
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Collage Generator (Large & Small Only)</h2>
      <p>Select how many images you want in your collage</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div>
          <label htmlFor="gridSize">Number of images: </label>
          <select
            id="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
            <option value={6}>6x6</option>
            <option value={7}>7x7</option>
          </select>
        </div>
      </div>
      <CollageGenerator items={items} settings={settings} gridSize={gridSize} />
    </div>
  );
};
{/* // Demo
const DemoCollage: React.FC = () => {
  const [items, setItems] = useState<ImageItem[]>([]);

  useEffect(() => {
    const demoItems: ImageItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      link: `https://picsum.photos/300/200?random=${i + 1}`,
      title: `Image ${i + 1}`,
    }));

    setItems(demoItems);
  }, []);

  const settings: CollageSettings = {
    showName: true,
    containerWidth: 800,
    containerHeight: 800,
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>10 Image Collage</h2>
      <CollageGenerator items={items} settings={settings} />
    </div>
  );
}; */}

export default DemoCollage;
