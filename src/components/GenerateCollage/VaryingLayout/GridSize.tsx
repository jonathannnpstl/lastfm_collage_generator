import React from "react";
import { StepProps } from "@/utils/types";
import Button from "@/components/Button";
import { COLLAGE_LAYOUTS } from "./layout";
import OptionSelector from "@/components/RadioOption";

const GridSize: React.FC<StepProps> = ({
  settingsData,
  updateSettingsData,
  nextStep,
  prevStep,
}) => {


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
      <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 space-y-6 min-w-sm"
    >

        <h2 className="text-lg font-semibold text-gray-800">
          Select grid size.
        </h2>

        <OptionSelector
          options={[
            {name: "4", label: "4x4"},
            {name: "5", label: "5x5"},
            {name: "6", label: "6x6"},
          ]}
          selected={settingsData.gridSize.toString()}
          onChange={(value) => {
            updateSettingsData("gridSize", parseInt(value))
            updateSettingsData("imageCount", COLLAGE_LAYOUTS[parseInt(value) as keyof typeof COLLAGE_LAYOUTS].imageCount || 4);
          }}
          />
        <Button type="submit">Next</Button>
        <Button type="button" onClick={prevStep} bgColor="bg-gray-500 hover:bg-gray-600">Back</Button>
      </form>
  );
};

export default GridSize;
