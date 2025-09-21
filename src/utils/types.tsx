export type CollageSettings = {
  username: string;
  duration: string;
  row_col: number[];
  showName: boolean;
  type: "tracks" | "albums" | null;
  gridLayout: "fixed" | "varying"
  gridSize: number,
  imageCount: number,
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

export type StepProps = {
  settingsData: CollageSettings;
  maxSize?: number;
  updateSettingsData: (
    field: keyof CollageSettings,
    value: number | string | number[] | boolean | null 
  ) => void;
  nextStep: () => void;
  prevStep: () => void;

};


export interface GridPosition { row: number; col: number; }
export type SizePositions = GridPosition[] | Record<number, GridPosition[]>;
export interface SizeDef {
  type: 'small' | 'medium' | 'large';
  count: number;
  size: number;
  positions?: SizePositions;
}
export interface CollageLayout {
  grid: { cols: number; rows: number };
  sizes: SizeDef[];
  imageCount: number;
}

export interface Assignment {
  index: number;
  size: number;
  position?: GridPosition;
}

export interface Assignment {
  index: number;
  size: number;
  position?: GridPosition;
}


// one image entry
interface LastFmImage {
  size: string;       // "small" | "medium" | "large" | "extralarge"
  '#text': string;    // URL of the image
}

// the nested artist object
interface LastFmArtist {
  url: string;
  name: string;
  mbid: string;
}

// the @attr object
interface LastFmAttr {
  rank: string;
}

// a single track/album item from the API
export interface LastFmAlbum {
  artist: LastFmArtist;
  image: LastFmImage[];
  mbid: string;
  url: string;
  playcount: string;   // the API returns it as string
  '@attr': LastFmAttr;
  name: string;
}


// streamable object
export interface LastFmStreamable {
  fulltrack: string; // "0" or "1"
  '#text': string;
}


// the track item itself
export interface LastFmTrack {
  streamable: LastFmStreamable;
  mbid: string;
  name: string;
  image: LastFmImage[];
  artist: LastFmArtist;
  url: string;
  duration: string;
  '@attr': LastFmAttr;
  playcount: string;
}
