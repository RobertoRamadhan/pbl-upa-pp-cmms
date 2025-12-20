 "use client"

import { Dialog } from '@headlessui/react';
import { formatDate } from '@/lib/utils/date';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  submittedBy: string;
  submittedAt: string;
}

interface Props {
  isOpen: boolean;
  report: Report | null;
  onClose: () => void;
}

export default function ReportDetailDialog({ isOpen, report, onClose }: Props) {
  if (!report) return null;

  const statusRank = (s: Report['status']) => {
    if (s === 'completed') return 3;
    if (s === 'assigned' || s === 'inProgress') return 2;
    return 1; // pending or default
  };

  const rank = statusRank(report.status);

  const steps = [
    { key: 'open', label: 'Open', done: rank >= 1, time: report.submittedAt },
    { key: 'pending', label: 'Pending', done: rank >= 2, time: undefined },
    { key: 'close', label: 'Close', done: rank >= 3, time: undefined },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true" />

      <div className="relative z-50 w-full max-w-2xl mx-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-black">{report.title}</h3>
              <p className="text-xs text-gray-500 mt-1">ID: {report.id}</p>
            </div>
            <button
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 ml-4 cursor-pointer font-medium"
              onClick={onClose}
              aria-label="Tutup detail"
            >
              Tutup
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700">Deskripsi</h4>
              <p className="text-sm text-gray-700 mt-2">{report.description}</p>

              <div className="mt-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">Pelapor:</span> {report.submittedBy}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tanggal:</span> {formatDate(report.submittedAt)}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status saat ini:</span> {report.status}
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking</h4>
              <div className="space-y-4">
                {steps.map((s, idx) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold
                          ${s.done ? 'bg-blue-600' : 'bg-gray-200 text-gray-500'}`}
                      >
                        {s.done ? '✓' : idx + 1}
                      </div>
                      {idx < steps.length - 1 && <div className="h-6 border-r-2 border-gray-200 mt-1"></div>}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-800">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.time ? formatDate(s.time) : '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
