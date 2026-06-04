import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">eCommerce Platform</h1>
        <p className="text-center text-gray-600 mt-4">Phase 1: Infrastructure Complete ✓</p>
      </div>
    </div>
  );
}

export default App;
