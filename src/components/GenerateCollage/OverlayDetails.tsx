import React, { useState } from "react";

type Props = {
  formData: { showName: boolean };
  updateFormData: (field: "showName", value: | boolean) => void;
  nextStep: () => void;
};


const OverlayDetailsForm: React.FC<Props> = ({
  updateFormData,
  nextStep,
}) => {

  const handleYes = () => {
    updateFormData("showName", true);
    nextStep();
  };

  const handleNo = () => {
    updateFormData("showName", false);
    nextStep();
  };
  return (
     <div
      className="max-w-md mx-auto p-6 space-y-6"
    >

        <h2 className="text-lg font-semibold text-gray-800">
        Do you want to overlay the album and artist name on each cover?
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
