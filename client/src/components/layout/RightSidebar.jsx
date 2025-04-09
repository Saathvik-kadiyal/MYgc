import { Link, useLocation } from 'react-router-dom';

const RightSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/messages', label: 'Messages', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.857L3 20l1.4-3.5A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
    { path: '/search', label: 'Search', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
    )},
  ];

  return (
    <div className="p-4 space-y-4">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${location.pathname === item.path 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default RightSidebar;
