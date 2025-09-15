import React, { useState } from "react";

type Props = {
  settingsData: { type: "tracks" | "albums" | null };
  updateSettingsData: (field: "type", value: "tracks" | "albums" | null) => void;
  nextStep: () => void;
};


const TypeDetailsForm: React.FC<Props> = ({
  updateSettingsData,
  nextStep,
}) => {

  const handleAlbum = () => {
    updateSettingsData("type", "albums");
    nextStep();
  };

  const handleTrack = () => {
    updateSettingsData("type", "tracks");
    nextStep();
  };
  return (
     <div
      className="max-w-md mx-auto p-6 space-y-6"
    >

        <h2 className="text-lg font-semibold text-gray-800">
        What type of collage would you like to create?
        </h2>
      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleAlbum}
      >
        Albums
      </button>

      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleTrack}
      >
        Tracks
      </button>
    </div>
  );
};

export default TypeDetailsForm;
