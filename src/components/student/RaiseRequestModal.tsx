import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createCorrectionRequest } from '../../services/requestService';
import { formatReadableDate } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import { X, Send, AlertCircle } from 'lucide-react';

interface RaiseRequestModalProps {
  dateStr: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RaiseRequestModal: React.FC<RaiseRequestModalProps> = ({
  dateStr,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim() || reason.trim().length < 5) {
      setError('Please enter a clear reason (at least 5 characters).');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await createCorrectionRequest({
        studentUid: user.uid,
        studentName: user.name,
        rollNumber: user.rollNumber || 'N/A',
        teamId: user.teamId || 'vibe-coding',
        attendanceDate: dateStr,
        reason: reason.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit correction request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#262626] rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <h3 className="text-sm font-bold text-white font-mono">
            Raise Attendance Correction Request
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#181818]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-200 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-[#181818] p-3 rounded-lg border border-[#262626]">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Date</span>
              <span className="font-medium text-zinc-200">{formatReadableDate(dateStr)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block mb-0.5">Current Status</span>
              <StatusBadge status="absent" label="ABSENT" />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5 font-mono">
              Reason for Absence / Correction Request <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for missing attendance (e.g., college duty, hackathon participation, approved medical leave)..."
              required
              className="w-full bg-[#181818] border border-[#262626] rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#181818] hover:bg-[#262626] text-zinc-300 rounded-lg font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-blue-900/30"
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
