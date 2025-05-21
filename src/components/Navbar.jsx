import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Brain, User, LogOut, Loader2 } from 'lucide-react';
import { logout } from '../services/authService';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // After logout, redirect to login page
    navigate('/login');
  };

  if (loading.user) {
    return (
      <nav className="bg-[#14122B] border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                StudyHub
              </Link>
            </div>
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-purple" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#14122B] border-b border-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              StudyHub
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <User className="h-5 w-5" />
                  <span>{user.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 