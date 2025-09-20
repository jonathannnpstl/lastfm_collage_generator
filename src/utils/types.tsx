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
