import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  GitPullRequest, 
  Users, 
  PieChart, 
  User, 
  BookOpen, 
  Shield 
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';

  const facultyNav = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Mark Attendance', path: '/faculty/attendance/mark', icon: CheckSquare },
    { label: 'Attendance Records', path: '/faculty/attendance', icon: FileText },
    { label: 'Correction Requests', path: '/faculty/attendance-requests', icon: GitPullRequest },
    { label: 'Team Attendance', path: '/faculty/team-attendance', icon: BookOpen },
    { label: 'Members', path: '/faculty/members', icon: Users },
    { label: 'Attendance Summary', path: '/faculty/attendance-summary', icon: PieChart },
    { label: 'Profile', path: '/faculty/profile', icon: User },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/student/attendance', icon: CheckSquare },
    { label: 'My Requests', path: '/student/requests', icon: GitPullRequest },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  const navItems = isFaculty ? facultyNav : studentNav;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#000000] border-r border-[#262626] transition-transform duration-200 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col justify-between`}
    >
      <div className="py-4 px-3 space-y-6">
        {/* Role Badge */}
        <div className="px-3 py-2 bg-[#111111] border border-[#262626] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFaculty ? (
              <Shield className="w-4 h-4 text-blue-500" />
            ) : (
              <User className="w-4 h-4 text-green-500" />
            )}
            <span className="text-xs font-mono font-semibold text-zinc-200 uppercase">
              {isFaculty ? 'Faculty Portal' : 'Student Portal'}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.endsWith('/dashboard')}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#111111]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-[#262626] text-[10px] font-mono text-zinc-400 text-center">
        <span>MITRAPULSE v5.0</span>
        <div className="text-[9px] text-zinc-500 mt-0.5">Vishnu Institute of Technology</div>
      </div>
    </aside>
  );
};
