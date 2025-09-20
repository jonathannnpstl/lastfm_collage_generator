import React, { useState } from "react";
import { StepProps } from "@/utils/types";


const GridLayoutDetails: React.FC<StepProps> = ({
  settingsData,
  updateSettingsData,
  nextStep,
}) => {

  const handleFixed = () => {
    updateSettingsData("gridLayout", "fixed");
    
    nextStep();
  };
  
  const handleVarying = () => {
    updateSettingsData("gridLayout", "varying");
    console.log(settingsData.gridLayout);
    nextStep();
  };
  return (
     <div
      className="max-w-md mx-auto p-6 space-y-6"
    >

        <h2 className="text-lg font-semibold text-gray-800">
        Select a grid layout?
        </h2>
      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleFixed}
      >
        Fixed size
      </button>

      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleVarying}
      >
        Varying sizes
      </button>
    </div>
  );
};

export default GridLayoutDetails;
