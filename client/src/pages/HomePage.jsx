import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setRole } from '../store/slices/authSlice';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleRoleSelection = (role) => {
        dispatch(setRole(role));
        navigate('/signup');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to MYgc</h1>
                <p className="text-lg text-gray-600">Connect, Create, and Grow</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Creator Card */}
                <div 
                    className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => handleRoleSelection('user')}
                >
                    <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join as Creator</h2>
                        <p className="text-gray-600 mb-6">
                            Showcase your skills, connect with brands, and grow your career
                        </p>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Brand Card */}
                <div 
                    className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => handleRoleSelection('company')}
                >
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join as Brand</h2>
                        <p className="text-gray-600 mb-6">
                            Find talented creators, post jobs, and build your brand
                        </p>
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default HomePage;
