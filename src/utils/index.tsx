import { CollageSettings } from "./types";
import { GRID_SELECTOR_SIZE } from "./constants";

export function transformPeriodFormat(period: string): string {
  switch (period.replace(/\s+/g, "").toLowerCase()) {
    case "1week":
      return "7day";
    case "1month":
      return "1month";
    case "3months":
      return "3month";
    case "6months":
      return "6month";
    case "12months":
      return "12month";
    case "overall":
      return "overall";
    default:
      return "7day";
  }
}

export function validateCollageSettings (settings: {
  username: string;
  duration: string;
  row_col: number[];
  showName: boolean;
}): { valid: boolean; message?: string } {
  const { username, duration, row_col, showName } = settings;

  if (!username || username.trim() === "") {
    return { valid: false, message: "Username cannot be empty." };
  }
  

  const validDurations = [
    "7day",
    "1month",
    "3month",
    "6month",
    "12month",
    "overall",
  ];
  if (!validDurations.includes(duration)) {
    return { valid: false, message: "Invalid duration selected." };
  }

  if (
    !Array.isArray(row_col) ||
    row_col.length !== 2 ||
    !row_col.every((num) => Number.isInteger(num) && num >= 0 && num <= GRID_SELECTOR_SIZE-1)
  ) {
    return { valid: false, message: "Row and column values must be positive integers between 0 and N." };
  }

  return { valid: true };
}

export function setCollageSettings (settings: CollageSettings): { username: string; duration: string; row: number; col: number; showName: boolean; type: "tracks" | "albums" | null } {
  const { username, duration, row_col, showName, type } = settings;

  return {
    username: username.trim(),
    duration,
    row: row_col[0] + 1,
    col: row_col[1] + 1,
    showName,
    type,
  };
}   

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}