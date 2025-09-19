import React from 'react';
import { WalletIcon } from './icons';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              FinTrack Lite
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 hidden sm:block font-medium">Welcome, {user?.name}!</span>
            {user?.avatarUrl ? (
              <img
                className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                src={user.avatarUrl}
                alt="User Avatar"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;