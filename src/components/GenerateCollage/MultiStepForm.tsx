"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UsernameForm from "./UsernameForm";
import DurationForm from "./DurationForm";
import GridSelector from "./GridSelector";
import OverlayDetailsForm from "./OverlayDetails";
import CollageGenerator from "./CollageGenerator";
import ArtistCollageGenerator from "./ArtistCollageGenerator";
import { CollageSettings } from "@/utils/types";
import TypeDetailsForm from "./TypeDetails";


const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [collageSettings, setCollageSettings] = useState<CollageSettings>({
    username: "",
    duration: "7day",
    row_col: [0, 0],
    showName: false,
    type: null
  });

  const updateCollageSettings = (field: keyof CollageSettings, value: string | number[] | boolean | null) => {
    setCollageSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const steps = [
    <UsernameForm
      key="step1"
      settingsData={collageSettings}
      updateSettingsData={updateCollageSettings}
      nextStep={nextStep}
    />,

    <TypeDetailsForm 
      key="step2"
      settingsData={collageSettings}
      updateSettingsData={updateCollageSettings}
      nextStep={nextStep}
    />,

    <DurationForm
      key="step3"
      settingsData={collageSettings}
      updateSettingsData={updateCollageSettings}
      nextStep={nextStep}
      prevStep={prevStep}
    />,

    <GridSelector
      maxSize={10}
      key="step4"
      settingsData={collageSettings}
      updateSettingsData={updateCollageSettings}
      nextStep={nextStep}
      prevStep={prevStep}
    />,

    <OverlayDetailsForm
      key="step5"
      settingsData={collageSettings}
      updateSettingsData={updateCollageSettings}
      nextStep={nextStep}
    />, 

    <CollageGenerator
      key="step6"
      settingsData={collageSettings}
    />
  ];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  return (
    <div className=" max-w-2xl bg-white p-6 flex flex-col justify-center overflow-hidden transition-all duration-300">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {steps[step - 1]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiStepForm;
