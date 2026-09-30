import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getRequestsForStudent, subscribeToStudentRequests } from '../../services/requestService';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { formatReadableDate } from '../../utils/dateUtils';
import { GitPullRequest, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const StudentRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getRequestsForStudent(user.uid).then((reqs) => {
      setRequests(reqs);
      setLoading(false);
    });

    const unsub = subscribeToStudentRequests(user.uid, (reqs) => {
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-blue-500" />
                Attendance Correction Requests History
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Track status of submitted absence correction applications
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Submitted Requests ({requests.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 space-y-2">
                <p>No correction requests raised yet.</p>
                <p className="text-[11px] text-zinc-600">
                  If your attendance status is marked Absent for a date you were present, navigate to My Attendance to raise a request.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Attendance Date</th>
                      <th className="px-4 py-3">Reason Provided</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3 text-right">Review Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">
                          {formatReadableDate(req.attendanceDate)}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300 max-w-xs truncate">
                          {req.reason}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">
                          {formatReadableDate(req.createdAt.substring(0, 10))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-400">
                          {req.status === 'pending' && (
                            <span className="text-amber-400/90 flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="text-green-400 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Approved (Status -&gt; Present)
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="text-red-400 flex items-center justify-end gap-1">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
