import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { PiWaveSineBold } from "react-icons/pi";
import NavItem from './NavItem';

export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show sidebar on home page
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/dashboard'
    },
    {
      name: 'Recordings',
      icon: PiWaveSineBold,
      path: '/recording'
    },
    {
      name: 'Profile',
      icon: FaUser,
      path: '/profile'
    },
    {
      name: 'Settings',
      icon: FaCog,
      path: '/settings'
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
      }`}>
      {/* Header with Logo and Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/brain-box-icon.png"
                alt="Brain Box"
                className="w-8 h-8"
              />
              <span className="text-xl font-medium text-primary-dark">Brain Box</span>
            </div>
          )}
          {isCollapsed && (
            <img
              src="/assets/images/brain-box-icon.png"
              alt="Brain Box"
              className="w-8 h-8 mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          >
            {isCollapsed ? (
              <FaChevronRight className="text-gray-600 text-lg" />
            ) : (
              <FaChevronLeft className="text-gray-600 text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              path={item.path}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <NavItem
          name="Logout"
          icon={FaSignOutAlt}
          path="/"
          isCollapsed={isCollapsed}
          onClick={handleLogout}
          variant="danger"
        />
      </div>
    </div>
  );
}