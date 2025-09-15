export type CollageSettings = {
  username: string;
  duration: string;
  row_col: number[];
  showName: boolean;
  type: "tracks" | "albums" | null;
};

export type Item = {
  link: string;
  title: string;
};

