import { Item } from "@/utils/types";
import { setCollageSettings, sleep } from "@/utils";
import { sortImages } from "@/utils/colorSort";
import { DEFAULT_IMAGE, DELAY_MS } from "@/utils/constants";

export const drawCollage = async (
    canvas: HTMLCanvasElement,
    items: Item[],
    settings: ReturnType<typeof setCollageSettings>,
    maxCanvasSize: number,
    arrangeBy: string
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const side = maxCanvasSize;

    canvas.width = settings.col * side * dpr;
    canvas.height = settings.row * side * dpr;
    canvas.style.width = `${settings.col * side}px`;
    canvas.style.height = `${settings.row * side}px`;
    ctx.scale(dpr, dpr);

    const items_res = await arrangeImages(arrangeBy, items)
    
    const promises = items_res.map((item, idx) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const row = Math.floor(idx / settings.col);
          const col = idx % settings.col;

          ctx.drawImage(img, col * side, row * side, side, side);
          if (settings.showName) {
            printName(ctx, col, row, item.title, side, true);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = item.link || DEFAULT_IMAGE;
      });
    });

    await Promise.all(promises);
    await sleep(DELAY_MS);

};

export function printName(
    ctx: CanvasRenderingContext2D,
    i: number, // column index
    j: number, // row index
    title: string,
    sideLength: number,
    overlay: boolean = false
  ) {
    ctx.textAlign = "center";

    // Font size scales with cell size and title length
    const fontSize = Math.min(
      (sideLength * 1.3) / title.length,
      sideLength / 15
    );
    ctx.font = `${fontSize}pt sans-serif`;

    const textX = i * sideLength + sideLength / 2;
    let textY;

    ctx.save();

    if (overlay) {
      // Draw background rectangle first
      const bgHeight = sideLength / 8; // ~12% of cell
      const bgY = j * sideLength + sideLength - bgHeight;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(i * sideLength, bgY, sideLength, bgHeight);

      // Shadow for better readability
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#2b2b2b";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "white";
      ctx.textBaseline = "bottom";
      textY = j * sideLength + sideLength - sideLength / 30;
    } else {
      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";
      textY = j * sideLength + sideLength / 2;
    }

    ctx.fillText(title, textX, textY);
    ctx.restore();
}

const arrangeImages = async (arrangeBy:string, items: Item[])=> {
    let arranged;
    switch (arrangeBy) {
    case "brightness":
        arranged = await sortImages(items, "brightness")
        break;
    case "hue":
        arranged = await sortImages(items, "hue")
        break;
    default:
        arranged = items
        break;
    }
    return arranged
}
