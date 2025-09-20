
import Button from "../Button";
import { StepProps } from "@/utils/types";


type OptionSelectorProps = {
  options: { name: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
};

const OptionSelector: React.FC<OptionSelectorProps> = ({ options, selected, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label
          key={option.name}
          className={`cursor-pointer flex items-center justify-center border px-4 py-3 text-sm font-medium transition rounded-full
            ${
              selected === option.name
                ? "bg-red-600 text-white border-red-600 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          <input
            type="radio"
            name="option"
            value={option.name}
            checked={selected === option.name}
            onChange={() => onChange(option.name)}
            required
            className="hidden"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

const DurationForm: React.FC<StepProps> = ({
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
      className="max-w-md mx-auto p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        How long do you want this collage to span?
      </h2>
      <OptionSelector
        options={[
          {name: "7day", label: "1 Week"},
          {name: "1month", label: "1 Month"},
          {name: "3month", label: "3 Months"},
          {name: "6month", label: "6 Months"},
          {name: "12month", label: "12 Months"},
          {name: "overall", label: "Overall"},
        ]}
        selected={settingsData.duration}
        onChange={(value) => {
          updateSettingsData("duration", value);
        }}
      />
      <Button children="Next" type="submit" />
      <Button children="Back" type="button" onClick={prevStep} bgColor="bg-gray-500 hover:bg-gray-600" />
    </form>
  );
};

export default DurationForm;
