import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getMembers, addMember, updateMember, deactivateMember, subscribeToMembers } from '../../services/memberService';
import { PREDEFINED_TEAMS, getTeamName } from '../../types/team';
import type { TeamId } from '../../types/team';
import type { Member } from '../../types/member';
import { memberFormSchema } from '../../utils/validation';
import { Users, UserPlus, Search, Filter, Edit2, UserX, X, AlertCircle } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deactivatingMember, setDeactivatingMember] = useState<Member | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [teamId, setTeamId] = useState<TeamId>('vibe-coding');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadMembersList = async () => {
    try {
      const mList = await getMembers();
      setMembers(mList);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadMembersList();

    const unsub = subscribeToMembers((mList) => {
      setMembers(mList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!user) return null;

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setRollNumber('');
    setTeamId('vibe-coding');
    setError(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setRollNumber(m.rollNumber);
    setTeamId(m.teamId);
    setError(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = memberFormSchema.safeParse({ name, email, rollNumber, teamId });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid form input.');
      return;
    }

    setSaving(true);
    try {
      await addMember({ name, email, rollNumber, teamId });
      setShowAddModal(false);
      await loadMembersList();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setError(null);

    const validation = memberFormSchema.safeParse({ name, email, rollNumber, teamId });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid form input.');
      return;
    }

    setSaving(true);
    try {
      await updateMember(editingMember.uid, { name, email, rollNumber, teamId });
      setEditingMember(null);
      await loadMembersList();
    } catch (err: any) {
      setError(err?.message || 'Failed to update member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivatingMember) return;
    try {
      await deactivateMember(deactivatingMember.uid);
      setDeactivatingMember(null);
      await loadMembersList();
    } catch {}
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeamFilter === 'all' || m.teamId === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Member Management Roster
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Add, edit, assign teams, or deactivate club members
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-blue-900/30"
            >
              <UserPlus className="w-4 h-4" />
              Add New Member
            </button>
          </div>

          {/* Search and Team Filter Bar */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, roll, or email..."
                className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-[#181818] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value="all">All Predefined Teams</option>
                {PREDEFINED_TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Roster Table */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Registered Members ({filteredMembers.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                No members found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Member Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Assigned Team</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {filteredMembers.map((m) => (
                      <tr key={m.uid} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">{m.name}</td>
                        <td className="px-4 py-3 font-mono text-zinc-400">{m.rollNumber}</td>
                        <td className="px-4 py-3 font-mono text-zinc-300">{m.email}</td>
                        <td className="px-4 py-3 font-mono text-blue-400">{getTeamName(m.teamId)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={m.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] text-blue-400 hover:text-blue-300 rounded transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {m.isActive && (
                              <button
                                onClick={() => setDeactivatingMember(m)}
                                className="p-1.5 bg-[#181818] hover:bg-red-950/80 border border-[#262626] text-zinc-400 hover:text-red-400 rounded transition-colors"
                                title="Deactivate Member"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Member Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111111] border border-[#262626] rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <h3 className="text-sm font-bold text-white font-mono">Add New Club Member</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200 font-mono">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Roll / Registration Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 21BCE1400"
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@vit.edu.in"
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Assign Predefined Team</label>
                    <select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value as TeamId)}
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none"
                    >
                      {PREDEFINED_TEAMS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-[#181818] hover:bg-[#262626] text-zinc-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md"
                    >
                      {saving ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Member Modal */}
          {editingMember && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111111] border border-[#262626] rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <h3 className="text-sm font-bold text-white font-mono">Edit Member Profile</h3>
                  <button onClick={() => setEditingMember(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200 font-mono">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleEditSubmit} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1">Assign Predefined Team</label>
                    <select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value as TeamId)}
                      className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-white focus:outline-none"
                    >
                      {PREDEFINED_TEAMS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-4 py-2 bg-[#181818] hover:bg-[#262626] text-zinc-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md"
                    >
                      {saving ? 'Saving...' : 'Update Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Deactivation Confirmation Modal */}
          {deactivatingMember && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111111] border border-[#262626] rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white">Deactivate Member</h3>
                <p className="text-zinc-400">
                  Are you sure you want to deactivate <span className="text-white font-bold">{deactivatingMember.name}</span>?
                  This sets <span className="text-amber-400">isActive = false</span>, removing them from future attendance marking while preserving all historical attendance data.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                  <button
                    onClick={() => setDeactivatingMember(null)}
                    className="px-3.5 py-2 bg-[#181818] hover:bg-[#262626] text-zinc-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivateConfirm}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-md"
                  >
                    Confirm Deactivation
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
