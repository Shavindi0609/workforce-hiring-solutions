import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Temporary components to test Tailwind v4 and Routing setup
const HomeSample = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 p-6 rounded-2xl shadow-xs text-center border border-slate-100">
    <h1 className="text-4xl font-bold text-blue-600 mb-4 tracking-tight animate-pulse">
      WHS Candidate Pool System 🚀
    </h1>
    <p className="text-gray-600 text-lg max-w-md">
      Tailwind CSS v4 and React + TypeScript setup is working perfectly! Your serverless frontend architecture is ready for Supabase services.
    </p>
    <Link 
      to="/settings" 
      className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-md"
    >
      Go to Profile Settings
    </Link>
  </div>
);

const SettingsSample = () => (
  <div className="p-8 bg-white rounded-2xl shadow-xs max-w-lg mx-auto mt-10 border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h2>
    <p className="text-gray-500 mb-6 text-sm">
      This route is ready. You can safely replace this view with your finalized ProfileSettings UI module.
    </p>
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <span className="block text-xs font-semibold text-emerald-600 uppercase tracking-wider">Status</span>
        <span className="text-sm font-medium text-emerald-800">Environment Active (Tailwind v4 Optimized)</span>
      </div>
    </div>
    <Link to="/" className="inline-block mt-6 text-sm text-blue-600 hover:underline">
      ← Back to Dashboard
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-900">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-xs">
          <span className="font-bold text-xl text-gray-800 tracking-tight">WHS System</span>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">Home</Link>
            <Link to="/settings" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">Settings</Link>
          </div>
        </nav>

        {/* Dynamic Route Content Rendering Layout */}
        <main className="max-w-6xl mx-auto p-6 mt-6">
          <Routes>
            <Route path="/" element={<HomeSample />} />
            <Route path="/settings" element={<SettingsSample />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;