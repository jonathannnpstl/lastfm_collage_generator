import React, { useState, useRef, useEffect } from "react";

type Props = {
  arrangement: string;
  setArrangement: (arrangement: string) => void;
};

const options = [
  { value: "rank", label: "Rank" },
  { value: "brightness", label: "Brightness" },
  { value: "hue", label: "Hue" },
];

const DropdownMenu: React.FC<Props> = ({ arrangement, setArrangement }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleArrangementChange = (arrangement: string) => {
    setArrangement(arrangement);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Dropdown button
        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" fill="none" viewBox="0 0 10 6">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
      {open && (
        <div className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-2">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                    arrangement === option.value
                      ? "bg-blue-100 dark:bg-blue-800 font-semibold"
                      : ""
                  }`}
                  onClick={() => handleArrangementChange(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;