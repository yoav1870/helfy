const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-48 rounded-t-lg"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
