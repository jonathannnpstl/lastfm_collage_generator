
const LoadingImages: React.FC = () => {
  return (
     <div className="flex flex-col items-center justify-center p-8">
        <div className="text-lg font-medium mb-4">Loading your data...</div>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      </div>
  );
};

export default LoadingImages;
