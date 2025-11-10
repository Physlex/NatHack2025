
import { useState } from 'react';
import { Card, Label, TextInput, Button } from 'flowbite-react';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';
import { useGlobalContext } from "../contexts/GlobalContext";

export default function Profile() {
  const { user, setLoading, loading } = useGlobalContext();
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Profile updated:', formData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-full flex flex-col px-8 py-12">
      <h1 className="!text-3xl font-bold mb-4">
        Profile
      </h1>

      <div className="w-full max-w-4xl">
        <Card className='!shadow-none p-2'>
          <div className="flex flex-col items-center pb-2">
            {
              user.image ? (
                <img
                  src={user.image}
                  alt="User Avatar"
                  className="w-36 h-36 rounded-full mb-4 self-center"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gray-300 mb-4 self-center flex items-center justify-center text-6xl text-white">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
              )
            }
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              {user.name}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name">Full Name</Label>
              </div>
              <TextInput
                id="name"
                name="name"
                type="text"
                icon={HiUser}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email">Email Address</Label>
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                icon={HiMail}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Password (Optional)</Label>
              </div>
              <TextInput
                id="password"
                name="password"
                type="password"
                icon={HiLockClosed}
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                color="alternative"
                onClick={() => {
                  setFormData(user);
                }}
                className='cursor-pointer transition-all duration-200'
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-light cursor-pointer transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
