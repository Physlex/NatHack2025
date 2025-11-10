
import { useState } from 'react';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'flowbite-react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useGlobalContext } from '../contexts/GlobalContext';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useGlobalContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Use global logout function
    logout();

    // Navigate to home/login page
    navigate('/');

    // Close the modal
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-full flex flex-col px-8 py-12">
      <h1 className="!text-3xl font-bold mb-4">
        Settings
      </h1>

      <div className="max-w-4xl space-y-6">
        <Card className='shadow-none'>
          <h2 className="text-xl font-semibold mb-4">System Information</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Application Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-medium">2.4 GB / 10 GB</span>
            </div>
          </div>
        </Card>
        <Card className='shadow-none'>
          <h2 className="text-xl font-semibold mb-4">Account</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col">
                <Label className="text-sm font-medium">Export Data</Label>
                <p className="text-sm text-gray-500">Download all your recordings and data</p>
              </div>
              <Button color="light" size="sm" className='cursor-pointer transition-all duration-200'>
                Export
              </Button>
            </div>

            <div className="border-t border-neutral-200/80 pt-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-red-600">Sign Out</Label>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
                <Button
                  color="red"
                  size="sm"
                  onClick={() => setShowLogoutModal(true)}
                  className='cursor-pointer transition-all duration-200'
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Logout Confirmation Modal */}
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
