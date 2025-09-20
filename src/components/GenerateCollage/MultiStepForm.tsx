"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UsernameForm from "./UsernameForm";
import DurationForm from "./DurationForm";
import GridSelector from "./FixedLayout/GridSelector";
import OverlayDetailsForm from "./OverlayDetails";
import TypeDetailsForm from "./TypeDetails";
import { CollageSettings } from "@/utils/types";
import GridLayoutDetails from "./GridLayoutDetails";
import GridSize from "./VaryingLayout/GridSize";
import { StepProps } from "@/utils/types";
import CollageVarying from "./VaryingLayout/CollageGenertor";
import CollageFixed from "./FixedLayout/CollageGenerator";

/**
 * Array-based step configuration (indices are used for navigation).
 * Branching logic returns a number index (or null to indicate "end").
 */

// step index constants (makes branching easier to read)
const STEP_USERNAME = 0;
const STEP_TYPE = 1;
const STEP_DURATION = 2;
const STEP_LAYOUT = 3;
const STEP_SELECTOR = 4
const STEP_SIZE = 5
const STEP_OVERLAY = 6;
const STEP_FIXED = 7;
const STEP_VARYING = 8;


type StepConfig = {
  id: string;
  Component: React.ComponentType<StepProps>;
  next: (data: CollageSettings) => number | null;
};

const steps: StepConfig[] = [
  {
    id: "username",
    Component: UsernameForm,
    next: () => STEP_TYPE,
  },
  {
    id: "type",
    Component: TypeDetailsForm,
    next: () => STEP_DURATION,
  },
  {
    id: "duration",
    Component: DurationForm,
    next: () => STEP_LAYOUT,
  },
  {
    id: "layout",
    Component: GridLayoutDetails,
    next: (data: CollageSettings) => {
      const layout = data.gridLayout
      console.log(layout);
      
     
      if (layout == "fixed") {
        return 4;
      } else if (layout == "varying") {
        return 5
      }
      return 4 //default to fixed layout
    },
  },
  {
    id: "grid",
    Component: GridSelector,
    // Branching logic AFTER GridSelector:
    // small grids (<= 9 cells) -> ask overlay details; otherwise skip to generator
    next: () => STEP_OVERLAY,
  },
  {
    id: "size",
    Component: GridSize,
    // Branching logic AFTER GridSelector:
    // small grids (<= 9 cells) -> ask overlay details; otherwise skip to generator
    next: () => STEP_OVERLAY,
  },
  {
    id: "overlay",
    Component: OverlayDetailsForm,
    next: (data: CollageSettings) => {
      const layout = data.gridLayout
      if (layout === "fixed") {
        return STEP_FIXED;
      } else if (layout === "varying") {
        return STEP_VARYING
      }
      return STEP_FIXED //default to fixed layout
    },
  },
  {
    id: "fixed",
    Component: CollageFixed,
    next: () => null, // terminal step
  },
  {
    id: "varying",
    Component: CollageVarying,
    next: () => null, // terminal step
  },
];

const MultiStepForm: React.FC = () => {
  const [collageSettings, setCollageSettings] = useState<CollageSettings>({
    username: "",
    duration: "7day",
    row_col: [0, 0],
    showName: false,
    type: null,
    gridLayout: "varying",
    gridSize: 4
  });

  const [currentIndex, setCurrentIndex] = useState<number>(STEP_USERNAME);
  const [history, setHistory] = useState<number[]>([STEP_USERNAME]);
  const [direction, setDirection] = useState<number>(0);

  const updateCollageSettings  = <K extends keyof CollageSettings>(
    field: K,
    value: CollageSettings[K]
  ) => {
    setCollageSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateAndNext = <K extends keyof CollageSettings>(
  field: K,
  value: CollageSettings[K]
) => {
  setCollageSettings((prev) => {
    const nextState = { ...prev, [field]: value };
    // compute next step from *nextState*, not old state:
    const nextIndex = steps[currentIndex].next(nextState);
    if (nextIndex != null && nextIndex !== currentIndex) {
      setDirection(nextIndex > currentIndex ? 1 : -1);
      setHistory((h) => [...h, nextIndex]);
      setCurrentIndex(nextIndex);
    }
    return nextState;
  });
};


  useEffect(() => {
    console.log("collageSettings changed", collageSettings);
  }, [collageSettings]);

  const nextStep = () => {
    const nextIndex = steps[currentIndex].next(collageSettings);
    if (nextIndex === null || nextIndex === undefined) return; // no next
    if (nextIndex === currentIndex) return; // avoid loop
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setHistory((h) => [...h, nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevStep = () => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const newHistory = h.slice(0, -1);
      const newIndex = newHistory[newHistory.length - 1];
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
      return newHistory;
    });
  };

  const Active = steps[currentIndex].Component;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="max-w-[800px] bg-white flex flex-col justify-center overflow-hidden transition-all duration-300">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex} // using index as key keeps Framer Motion consistent
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <Active
            settingsData={collageSettings}
            updateSettingsData={updateAndNext}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiStepForm;
