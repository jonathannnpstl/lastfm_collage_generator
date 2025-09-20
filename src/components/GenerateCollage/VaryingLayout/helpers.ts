import { COLLAGE_LAYOUTS } from "./layout";
import { DEFAULT_IMAGE } from "@/utils/constants";

interface CollageSettings {
  showName: boolean;
  containerWidth: number;
  containerHeight: number;
}

interface ImageItem {
  id: string;
  link: string;
  title: string;
  rank?: number;
}


export const findAvailablePositionForSquare = (
  grid: boolean[][],
  size: number,
  maxCol: number,
  maxRow: number
) => {
  for (let row = 0; row <= maxRow - size; row++) {
    for (let col = 0; col <= maxCol - size; col++) {
      if (
        canPlaceAtPosition(grid, col, row, size, size, maxCol, maxRow)
      ) {
        return { row, col };
      }
    }
  }
  return undefined;
};

export const canPlaceAtPosition = (
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

export const markCellsAsOccupied = (
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


export const drawCollage = async (canvas: HTMLCanvasElement, gridSize: number, settings: CollageSettings, items: ImageItem[]) => {
    // const canvas = canvasRef.current;
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
        variantKey = keys[Math.floor(Math.random() * keys.length)]; //make this incremental instead of incremental
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
} 