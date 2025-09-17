import { FastAverageColor } from "fast-average-color";
import { Item } from "./types";

type ImgWithColor = {
  src: string;
  color: [number, number, number];
  link: string,
  title: string
};

const fac = new FastAverageColor();

/**
 * Extract average color from an image
 */
async function getAverageColor(src: string): Promise<[number, number, number]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const color = fac.getColor(img);
        const [r, g, b] = color.value; // [r, g, b, a]
        resolve([r, g, b]);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
  });
}

/**
 * Convert RGB to HSV to sort by Hue
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = ((b - r) / d + 2);
    else h = ((r - g) / d + 4);
    h /= 6;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

/**
 * Sort images by brightness
 */
function sortByBrightness(images: ImgWithColor[]): ImgWithColor[] {
  return images.sort(
    (a, b) =>
      a.color[0] + a.color[1] + a.color[2] -
      (b.color[0] + b.color[1] + b.color[2])
  );
}

/**
 * Sort images by hue
 */
function sortByHue(images: ImgWithColor[]): ImgWithColor[] {
  return images.sort((a, b) => {
    const [hA] = rgbToHsv(...a.color);
    const [hB] = rgbToHsv(...b.color);
    return hA - hB;
  });
}

/**
 * Main function: fetch colors + sort
 */
export async function sortImages(
  items: Item[],
  method: "brightness" | "hue" = "brightness"
): Promise<Item[]> {
  // Extract colors
  const withColors: ImgWithColor[] = await Promise.all(
    items.map(async (item) => ({
      src: item.link,
      color: await getAverageColor(item.link),
      link: item.link,
      title: item.title
    }))
  );

  // Sort
  // if (method === "hue") return sortByHue(withColors);
  // return sortByBrightness(withColors);

  const sorted =
  method === "hue" ? sortByHue(withColors) : sortByBrightness(withColors);

  // Map back to Item type (only link and title)
  return sorted.map(({ link, title }) => ({ link, title }));
}
