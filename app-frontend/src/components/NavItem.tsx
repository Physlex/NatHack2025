import { useLocation, useNavigate } from 'react-router-dom';

interface NavItemProps {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  isCollapsed: boolean;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export default function NavItem({ 
  name, 
  icon: Icon, 
  path, 
  isCollapsed, 
  onClick,
  variant = 'default' 
}: NavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = location.pathname.startsWith(path);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
  };

  const getItemClasses = () => {
    const baseClasses = `w-full flex items-center gap-4 p-4 rounded-lg transition-colors font-medium cursor-pointer ${
      isCollapsed ? 'justify-center' : ''
    }`;
    
    if (variant === 'danger') {
      return `${baseClasses} text-red-600 hover:bg-red-50`;
    }
    
    if (isActive) {
      return `${baseClasses} bg-primary text-white`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <button
      onClick={handleClick}
      className={getItemClasses()}
      title={isCollapsed ? name : ''}
    >
      <Icon className="text-xl flex-shrink-0" />
      {!isCollapsed && <span>{name}</span>}
    </button>
  );
}