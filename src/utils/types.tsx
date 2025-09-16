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

export type Track = {
  title: string;
  artist: string;
  mbid: string;
};
