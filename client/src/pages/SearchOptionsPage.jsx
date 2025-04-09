import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBriefcase, FaUserTie } from 'react-icons/fa';

const SearchOptionsPage = () => {
  const navigate = useNavigate();

  const searchOptions = [
    {
      title: 'Freshers',
      description: 'Search for new talent and upcoming creators',
      icon: <FaUserGraduate className="w-12 h-12 text-blue-500" />,
      path: '/search/freshers'
    },
    {
      title: 'Brands',
      description: 'Find and connect with brands',
      icon: <FaBriefcase className="w-12 h-12 text-purple-500" />,
      path: '/search/brands'
    },
    {
      title: 'Experienced Users',
      description: 'Connect with experienced professionals',
      icon: <FaUserTie className="w-12 h-12 text-green-500" />,
      path: '/search/experienced'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Search Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {searchOptions.map((option) => (
          <div
            key={option.title}
            onClick={() => navigate(option.path)}
            className="bg-gray-800 rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {option.icon}
              <h2 className="text-xl font-semibold text-white">{option.title}</h2>
              <p className="text-gray-400">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchOptionsPage; 