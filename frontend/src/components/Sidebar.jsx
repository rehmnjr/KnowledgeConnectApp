import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, Menu, X, LogOut, Brain } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const navItems = [
    { icon: <Home className="h-5 w-5" />, name: 'Dashboard', path: '/' },
    { icon: <Search className="h-5 w-5" />, name: 'Discover Topics', path: '/discover' },
    { icon: <Calendar className="h-5 w-5" />, name: 'Scheduled Meetings', path: '/scheduled' },
    { icon: <User className="h-5 w-5" />, name: 'Profile', path: '/profile' },
  ];

  return (
    <div ref={sidebarRef}>
      <button 
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-purple/50 text-white hover:bg-purple/70 transition-colors duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-[#111827] transition-transform duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col px-4">
          <div className="flex items-center justify-center h-16 mb-4 mt-1">
            <div className="flex items-center space-x-2">
              {/* <Brain className="h-8 w-8 text-purple" /> */}
              <h1 className="text-xl font-bold text-white ml-[50px]">
                Knowledge<span className="text-purple">Connect</span>
              </h1>
            </div>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path 
                        ? 'bg-purple text-white' 
                        : 'text-gray-300 hover:bg-purple/20'
                    }`}
                    aria-current={location.pathname === item.path ? "page" : undefined}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto mb-3">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-purple/20 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
