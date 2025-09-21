"use client";

import React, { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";

// --- import your steps components ---
import UsernameForm from "./UsernameForm";
import DurationForm from "./DurationForm";
import GridSelector from "./FixedLayout/GridSelector";
import OverlayDetailsForm from "./OverlayDetails";
import TypeDetailsForm from "./TypeDetails";
import GridLayoutDetails from "./GridLayoutDetails";
import GridSize from "./VaryingLayout/GridSize";
import CollageVarying from "./VaryingLayout/CollageGenertor";
import CollageFixed from "./FixedLayout/CollageGenerator";

// --- types ---
import { CollageSettings, StepProps } from "@/utils/types";

// step index constants
const STEP_USERNAME = 0;
const STEP_TYPE = 1;
const STEP_DURATION = 2;
const STEP_LAYOUT = 3;
const STEP_SELECTOR = 4;
const STEP_SIZE = 5;
const STEP_OVERLAY = 6;
const STEP_FIXED = 7;
const STEP_VARYING = 8;

type StepConfig = {
  id: string;
  Component: React.ComponentType<StepProps>;
  next: (data: CollageSettings) => number | null;
};

// steps array (same as before)
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
    next: (data) => {
      const layout = data.gridLayout;
      console.log("layout", layout);
      if (layout === "fixed") return STEP_SELECTOR;
      if (layout === "varying") return STEP_SIZE;
      return STEP_SELECTOR;
    },
  },
  {
    id: "grid",
    Component: GridSelector,
    next: () => STEP_OVERLAY,
  },
  {
    id: "size",
    Component: GridSize,
    next: () => STEP_OVERLAY,
  },
  {
    id: "overlay",
    Component: OverlayDetailsForm,
    next: (data) => {
      if (data.gridLayout === "fixed") return STEP_FIXED;
      if (data.gridLayout === "varying") return STEP_VARYING;
      return STEP_FIXED;
    },
  },
  {
    id: "fixed",
    Component: CollageFixed,
    next: () => null,
  },
  {
    id: "varying",
    Component: CollageVarying,
    next: () => null,
  },
];

// --- combined reducer ---
type WizardState = {
  settings: CollageSettings;
  history: number[];
  currentIndex: number;
  direction: number;
};

type WizardAction =
  | { type: "UPDATE"; field: keyof CollageSettings; value: string | number | boolean | number[] | null  }
  | { type: "NEXT" }
  | { type: "PREV" };

const initialState: WizardState = {
  settings: {
    username: "",
    duration: "7day",
    row_col: [0, 0],
    showName: false,
    type: null,
    gridLayout: "varying",
    gridSize: 4,
    imageCount: 1
  },
  history: [STEP_USERNAME],
  currentIndex: STEP_USERNAME,
  direction: 0,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "UPDATE": {
      const newSettings = { ...state.settings, [action.field]: action.value };
      return { ...state, settings: newSettings };
    }

    case "NEXT": {
      const nextIndex = steps[state.currentIndex].next(state.settings);
      if (nextIndex == null || nextIndex === state.currentIndex) return state;
      return {
        ...state,
        history: [...state.history, nextIndex],
        currentIndex: nextIndex,
        direction: nextIndex > state.currentIndex ? 1 : -1,
      };
    }

    case "PREV": {
      if (state.history.length <= 1) return state;
      const newHistory = state.history.slice(0, -1);
      const newIndex = newHistory[newHistory.length - 1];
      return {
        ...state,
        history: newHistory,
        currentIndex: newIndex,
        direction: newIndex > state.currentIndex ? 1 : -1,
      };
    }

    default:
      return state;
  }
}

// --- main component ---
const MultiStepForm: React.FC = () => {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // helpers
  const updateSettingsData = <K extends keyof CollageSettings>(
    field: K,
    value: CollageSettings[K]
  ) => dispatch({ type: "UPDATE", field, value });

  const nextStep = () => dispatch({ type: "NEXT" });
  const prevStep = () => dispatch({ type: "PREV" });

  const Active = steps[state.currentIndex].Component;

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
      <AnimatePresence mode="wait" custom={state.direction}>
        <motion.div
          key={state.currentIndex}
          custom={state.direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <Active
            settingsData={state.settings}
            updateSettingsData={updateSettingsData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiStepForm;
