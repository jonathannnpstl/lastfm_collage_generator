import React from "react";
import { StepProps } from "@/utils/types";
import Button from "@/components/Button";
import { COLLAGE_LAYOUTS } from "./layout";
import { gridSizes } from "./layout";

const GridSize: React.FC<StepProps> = ({
  updateSettingsData,
  nextStep,
  prevStep,
}) => {


  const handleSelect = (size: number) => {
    // update settings for both fields
    updateSettingsData("gridSize", size);
    updateSettingsData(
      "imageCount",
      COLLAGE_LAYOUTS[size as keyof typeof COLLAGE_LAYOUTS].imageCount
    );
    nextStep();
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Select grid size.
      </h2>

      {gridSizes.map((size) => (
        <button
          key={size}
          type="button"
          className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
          onClick={() => handleSelect(size)}
        >
          {size}x{size}
        </button>
      ))}

      <Button
        children="Back"
        type="button"
        onClick={prevStep}
        bgColor="bg-gray-500 hover:bg-gray-600"
      />
    </div>
  );
};

export default GridSize;
