import React from 'react';
import { Link } from 'react-router-dom';

const RightSidebar = ({ isCompany, user, company, children }) => {
    const profile = isCompany ? company : user;
    const profileUsername = profile?.username;

    return (
        <div className="w-[300px] h-screen sticky top-0">
            <div className="w-full h-full border-l border-gray-800 bg-transparent p-4">
                {/* Profile Section */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                        <img
                            src={profile?.profilePicture || '/default-avatar.png'}
                            alt={profileUsername}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <Link
                                to={`/${profileUsername}`}
                                className="text-white font-semibold hover:text-blue-400"
                            >
                                {profile?.name || profileUsername}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {isCompany ? 'Company' : 'User'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-white font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to={`/${profileUsername}`}
                                className="text-gray-400 hover:text-white block"
                            >
                                View Profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/settings"
                                className="text-gray-400 hover:text-white block"
                            >
                                Settings
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Connection Components */}
                <div className="space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
