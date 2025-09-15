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
    !row_col.every((num) => Number.isInteger(num) && num >= 0 && num <= 9)
  ) {
    return { valid: false, message: "Row and column values must be positive integers between 0 and 9." };
  }

  return { valid: true };
}

export function setCollageSettings (settings: {
  username: string;
  duration: string;
  row_col: number[];
  showName: boolean;
}): { username: string; duration: string; row: number; col: number; showName: boolean } {
  const { username, duration, row_col, showName } = settings;

  return {
    username: username.trim(),
    duration,
    row: row_col[0] + 1,
    col: row_col[1] + 1,
    showName,
  };
}   