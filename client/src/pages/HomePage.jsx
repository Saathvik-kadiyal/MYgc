import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">Welcome to UGC Platform</h1>
        
        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/creator-type" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold">Get Started</h2>
            <p className="text-sm mt-2">Join our community</p>
          </Link>
        </div>

        <div className="text-center text-white">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
