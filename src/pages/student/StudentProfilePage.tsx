import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { getTeamName } from '../../types/team';
import { User, Mail, Shield, Award, Calendar, CheckCircle2 } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                Student Profile
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Official VIT Mitra Club Membership Record
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
                  <span className="px-2 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800 rounded font-mono text-[10px]">
                    {getTeamName(user.teamId)}
                  </span>
                  <span className="px-2 py-0.5 bg-green-950/80 text-green-400 border border-green-800 rounded font-mono text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Member
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
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Roll / Registration Number
                </span>
                <span className="text-zinc-200 font-semibold">{user.rollNumber || 'N/A'}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
                </span>
                <span className="text-zinc-200 font-semibold">{user.email}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> Assigned Team
                </span>
                <span className="text-zinc-200 font-semibold">{getTeamName(user.teamId)}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> Authorization Role
                </span>
                <span className="text-zinc-200 font-semibold uppercase">{user.role}</span>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Member Joined Date
                </span>
                <span className="text-zinc-200 font-semibold">
                  {user.createdAt ? user.createdAt.substring(0, 10) : '2026-01-15'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Student profile details and team assignments are managed by Faculty Coordinators.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
