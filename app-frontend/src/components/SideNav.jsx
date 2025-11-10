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
import { HiExclamationTriangle } from 'react-icons/hi2';
import NavItem from './NavItem';
import { useGlobalContext } from '../contexts/GlobalContext';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react';

export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useGlobalContext();

  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    // Use global logout function
    logout();
    setShowLogoutModal(false);
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/brain-box-icon.png"
                alt="Brain Box"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-primary-dark">Brain Box</span>
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

      <div className="p-4 border-t border-gray-200">
        <NavItem
          name="Logout"
          icon={FaSignOutAlt}
          path="/"
          isCollapsed={isCollapsed}
          onClick={() => setShowLogoutModal(true)}
          variant="danger"
        />
      </div>

      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} size="md">
        <ModalHeader className="border-b border-gray-200">
          <div className="flex items-center">
            <HiExclamationTriangle className="text-red-500 mr-2" />
            Confirm Sign Out
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-neutral-700">
            Are you sure you want to sign out? You'll need to sign in again to access your recordings and data.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="alternative"
            onClick={() => setShowLogoutModal(false)}
            className='cursor-pointer transition-all duration-200'
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleLogout}
            className='cursor-pointer transition-all duration-200'
          >
            <FaSignOutAlt className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}