import Button from "../Button";

const ErrorLoading: React.FC = () => {
  const errors = [
    "Insufficient data fetched.",
    "Connection issues.",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-3">Possible reasons are the following:</p>
      <ul className="text-gray-500 text-sm list-disc list-inside space-y-1">
        {errors.map((err, idx) => (
          <li key={idx}>{err}</li>
        ))}
      </ul>
      <Button bgColor="bg-red-600 hover:bg-red-700 mt-6" onClick={() => window.location.reload()} >Try Again</Button>
    </div>
  );
};

export default ErrorLoading;
