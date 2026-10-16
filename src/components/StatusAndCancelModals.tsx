import React, { useState } from 'react';
import { X, Truck, Check, AlertCircle } from 'lucide-react';
import type { LR, LRStatus } from '../types/index';
import { api } from '../services/api';

interface StatusModalProps {
  lr: LR;
  onClose: () => void;
  onSuccess: (updated: LR) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ lr, onClose, onSuccess }) => {
  const [status, setStatus] = useState<LRStatus>(lr.status);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    lr.deliveryDate || new Date().toISOString().split('T')[0]
  );
  const [receivedBy, setReceivedBy] = useState<string>(lr.deliveryReceivedBy || '');
  const [podReference, setPodReference] = useState<string>(lr.podReference || '');
  const [remarks, setRemarks] = useState<string>(lr.deliveryRemarks || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const updated = await api.updateLRStatus(lr.id, status, {
        deliveryDate: status === 'Delivered' ? deliveryDate : undefined,
        receivedBy: status === 'Delivered' ? receivedBy : undefined,
        podReference: status === 'Delivered' ? podReference : undefined,
        remarks: status === 'Delivered' ? remarks : undefined
      });
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Update Status — {lr.lrNumber}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as LRStatus)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="Booked">Booked (At Origin)</option>
              <option value="In Transit">In Transit (Dispatched on Road)</option>
              <option value="Delivered">Delivered (Completed)</option>
            </select>
          </div>

          {status === 'Delivered' && (
            <div className="space-y-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg animate-in fade-in">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Proof of Delivery (POD) Details
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Actual Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Received By (Receiver Name / Designation) *
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  required
                  placeholder="e.g. S. Kumar (Store In-charge)"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  POD / Ack Slip Reference No.
                </label>
                <input
                  type="text"
                  value={podReference}
                  onChange={e => setPodReference(e.target.value)}
                  placeholder="e.g. POD-CH-8821"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Delivery Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Verified packages, seal intact"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md"
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CancelModalProps {
  lr: LR;
  onClose: () => void;
  onSuccess: (cancelled: LR) => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({ lr, onClose, onSuccess }) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this LR');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const cancelled = await api.cancelLR(lr.id, reason.trim());
      onSuccess(cancelled);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel LR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">Cancel LR — {lr.lrNumber}</h3>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCancel} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Cancelling this LR will mark it as Cancelled in the database, preserve its audit history, and exclude its freight from active financial ledgers and collection reports.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              placeholder="e.g. Booking cancelled by party / duplicate entry / wrong vehicle number"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
