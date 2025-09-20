
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

export default OptionSelector