import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { User, Mail, Shield, Building2, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FacultyProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                Faculty Profile & Credentials
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Authorized Faculty Coordinator Account
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 shadow-xl max-w-2xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#262626]">
              <div className="w-16 h-16 rounded-full bg-blue-950/80 border-2 border-blue-600 flex items-center justify-center text-blue-400 font-bold font-mono text-xl shadow-lg">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800 rounded font-mono text-[10px] flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Authorized Faculty Coordinator
                  </span>
                  <span className="px-2 py-0.5 bg-green-950/80 text-green-400 border border-green-800 rounded font-mono text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Session
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Full Name
                </span>
                <span className="text-zinc-200 font-semibold">{user.name}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
                </span>
                <span className="text-zinc-200 font-semibold">{user.email}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> Role Type
                </span>
                <span className="text-zinc-200 font-semibold uppercase">{user.role}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Organization
                </span>
                <span className="text-zinc-200 font-semibold">VIT Mitra, Vishnu Institute of Technology</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">
                Session ID: {user.uid}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-950/80 hover:bg-red-900/80 border border-red-800 text-red-300 font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <LogOut className="w-4 h-4" />
                Logout Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
