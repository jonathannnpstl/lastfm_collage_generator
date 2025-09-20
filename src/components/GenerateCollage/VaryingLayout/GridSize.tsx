import React, { useState } from "react";
import { StepProps } from "@/utils/types";
import Button from "@/components/Button";

const GridSize: React.FC<StepProps> = ({
  updateSettingsData,
  nextStep,
  prevStep
}) => {

  const handle4 = () => {
    updateSettingsData("gridSize", 4);
    // nextStep();
  };

  const handle5 = () => {
    updateSettingsData("gridSize", 5);
    // nextStep();
  };

  const handle6 = () => {
    updateSettingsData("gridSize", 6);
    // nextStep();
  };

  return (
     <div
      className="max-w-md mx-auto p-6 space-y-6"
    >

        <h2 className="text-lg font-semibold text-gray-800">
            Select grid size.
        </h2>
      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handle4}
      >
        4x4
      </button>

      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handle5}
      >
        5x5
      </button>
      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handle6}
      >
        6x6
      </button>
      <Button children="Back" type="button" onClick={prevStep} bgColor="bg-gray-500 hover:bg-gray-600" />
    </div>
  );
};

export default GridSize;
