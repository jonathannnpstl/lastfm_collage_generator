import React from "react";
import { StepProps } from "@/utils/types";



const OverlayDetailsForm: React.FC<StepProps> = ({
  updateSettingsData,
  nextStep,
}) => {

  const handleYes = () => {
    updateSettingsData("showName", true);
    nextStep();
  };

  const handleNo = () => {
    updateSettingsData("showName", false);
    nextStep();
  };
  return (
     <div
      className="max-w-md mx-auto p-6 space-y-6"
    >

        <h2 className="text-lg font-semibold text-gray-800">
        Do you want to overlay the details on each item?
        </h2>
      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleYes}
      >
        Yes
      </button>

      <button
        type="button"
        className="w-full rounded-md bg-red-700 text-white px-6 py-3 font-medium hover:bg-red-800 transition cursor-pointer"
        onClick={handleNo}
      >
        No
      </button>
    </div>
  );
};

export default OverlayDetailsForm;
