import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getAllRequests, approveCorrectionRequest, rejectCorrectionRequest, subscribeToAllRequests } from '../../services/requestService';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { formatReadableDate } from '../../utils/dateUtils';
import { getTeamName } from '../../types/team';
import { GitPullRequest, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const AttendanceRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const reqs = await getAllRequests();
      setRequests(reqs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();

    const unsub = subscribeToAllRequests((reqs) => {
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!user) return null;

  const handleApprove = async (reqId: string) => {
    setError(null);
    setSuccessMessage(null);
    setProcessingId(reqId);

    try {
      await approveCorrectionRequest(reqId, user.uid);
      setSuccessMessage('Correction request approved! Attendance record has been updated to Present.');
      await loadRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reqId: string) => {
    setError(null);
    setSuccessMessage(null);
    setProcessingId(reqId);

    try {
      await rejectCorrectionRequest(reqId, user.uid);
      setSuccessMessage('Correction request rejected. Attendance status remains Absent.');
      await loadRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const finalizedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-amber-500" />
                Attendance Correction Requests Management
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Review, approve, or reject student requests for attendance correction
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-950/60 border border-green-800 rounded-lg flex items-center gap-2 text-xs text-green-200 font-mono">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Pending Requests Section */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending Requests Awaiting Review ({pendingRequests.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                No pending correction requests requiring review.
              </div>
            ) : (
              <div className="divide-y divide-[#262626]">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#181818]/40 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-white">{req.studentName}</span>
                        <span className="text-zinc-500">({req.rollNumber})</span>
                        <span className="px-2 py-0.5 bg-[#181818] border border-[#262626] rounded text-[10px] text-blue-400">
                          {getTeamName(req.teamId)}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-300">
                        Date Requested: <span className="text-white font-bold">{formatReadableDate(req.attendanceDate)}</span>
                      </div>
                      <p className="text-xs font-mono text-zinc-400 bg-[#181818] p-2.5 rounded-lg border border-[#262626]">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <button
                        type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleApprove(req.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve (Mark Present)
                      </button>

                      <button
                        type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleReject(req.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finalized Requests History */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Finalized Requests History ({finalizedRequests.length})
              </h3>
            </div>

            {finalizedRequests.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-zinc-500">
                No finalized requests recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Attendance Date</th>
                      <th className="px-4 py-3">Final Decision</th>
                      <th className="px-4 py-3 text-right">Reviewed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {finalizedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">{req.studentName}</td>
                        <td className="px-4 py-3 font-mono text-zinc-400">{req.rollNumber}</td>
                        <td className="px-4 py-3 font-mono text-zinc-300">{getTeamName(req.teamId)}</td>
                        <td className="px-4 py-3 font-mono text-white">{formatReadableDate(req.attendanceDate)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-400">
                          {req.reviewedAt ? formatReadableDate(req.reviewedAt.substring(0, 10)) : 'N/A'}
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
