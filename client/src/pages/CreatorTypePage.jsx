import { Link, useNavigate } from 'react-router-dom';

const CreatorTypePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">Join UGC Platform</h1>
        
        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold">Join as Creator</h2>
            <p className="text-sm mt-2">For content creators and influencers</p>
          </Link>
          
          <Link 
            to="/CompanySignup" 
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold">Join as Company</h2>
            <p className="text-sm mt-2">For brands and businesses</p>
          </Link>
        </div>

        <div className="text-center text-white">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorTypePage;
