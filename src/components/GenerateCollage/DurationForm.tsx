import Button from "../Button";
import { StepProps } from "@/utils/types";
import OptionSelector from "../RadioOption";




const DurationForm: React.FC<StepProps> = ({
  settingsData,
  updateSettingsData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // updateSettingsData("duration", duration);
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
          updateSettingsData("duration", value)
        }}
      />
      <Button type="submit">
        Next
      </Button>
      <Button type="button" onClick={prevStep} bgColor="bg-gray-500 hover:bg-gray-600">Back</Button>
    </form>
  );
};

export default DurationForm;
