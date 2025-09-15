import React, { useState } from "react";
import Button from "../Button";

type Props = {
  settingsData: { username: string; duration: string; row_col: number[] };
  maxSize?: number;
  updateSettingsData: (
    field: "username" | "duration" | "row_col",
    value: string | number[]
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const GridSelector: React.FC<Props> = ({ maxSize = 20, settingsData, updateSettingsData, nextStep, prevStep, }) => {
  const [hover, setHover] = useState<{ row: number; col: number }>({
    row: -1,
    col: -1,
  });

  const [selected, setSelected] = useState<{ row: number; col: number }>({
    row: settingsData.row_col[0],
    col: settingsData.row_col[1],
  });

  const handleMouseEnter = (row: number, col: number) => {
    setHover({ row, col });
  };

  const handleClick = (row: number, col: number) => {
    const newSelection = { row, col };
    setSelected(newSelection);
    updateSettingsData("row_col", [row, col]);
  };

  const handleMouseLeave = () => {
    setHover({ row: -1, col: -1 });
  };

  return (
    <>
    <div>
     <h2 className="text-lg font-semibold text-gray-800">
        Select the grid size for your collage.
      </h2>
    {(
      <p className="text-2xl font-semibold text-gray-800 text-center m-4"> {selected?.row + 1} x {selected?.col + 1} ( {hover.row + 1} x {hover.col + 1} )</p>
    )}
    </div>

    <div
      style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxSize}, 1fr)`,
          aspectRatio: "1 / 1",
          width: "80vmin",
          maxWidth: "600px",
          border: "2px solid white",
        }}
        onMouseLeave={handleMouseLeave}
        >
      {Array.from({ length: maxSize }).map((_, row) =>
        Array.from({ length: maxSize }).map((_, col) => {
            const isHovered =
            hover.row >= 0 && row <= hover.row && col <= hover.col;
            
            const isSelected =
            selected && row <= selected.row && col <= selected.col;
            
            let bgColor = "#333"; 
            if (isSelected) {
              bgColor = "crimson"; 
            } else if (isHovered) {
              bgColor = "maroon";
            }

          return (
              <div
              key={`${row}-${col}`}
              onMouseEnter={() => handleMouseEnter(row, col)}
              onClick={() => handleClick(row, col)}
              style={{
                  border: "1px solid white",
                  backgroundColor: bgColor,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                />
            );
        })
    )}
    </div>

    <Button children="Next" type="button" onClick={nextStep} className="my-4" />
    <Button children="Back" type="button" onClick={prevStep} bgColor="bg-gray-500 hover:bg-gray-600" />
    </>
  );
};

export default GridSelector;
