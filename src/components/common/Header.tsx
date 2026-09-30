import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MitraLogo } from './MitraLogo';
import { LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#000000] border-b border-[#262626] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#181818]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <MitraLogo size="sm" showSubtitle={false} />
          <span className="text-xs font-mono font-bold tracking-wider text-blue-500 border-l border-zinc-800 pl-3.5 ml-1 hidden sm:inline">
            PULSE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-medium text-white">{user.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                {user.role === 'faculty' ? (
                  <>
                    <Shield className="w-2.5 h-2.5 text-blue-400" /> Faculty Coordinator
                  </>
                ) : (
                  <>
                    <UserIcon className="w-2.5 h-2.5 text-green-400" /> Student ({user.rollNumber})
                  </>
                )}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 bg-[#111111] hover:bg-[#181818] border border-[#262626] text-zinc-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
