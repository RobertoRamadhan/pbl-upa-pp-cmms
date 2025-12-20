'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface Technician {
  id: string;
  name: string;
  department: string | null;
  status: 'Available' | 'Busy';
}

interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  onAssign: (technicianId: string) => Promise<void>;
}

export default function AssignmentDialog({ isOpen, onClose, ticketId, onAssign }: AssignmentDialogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
    }
  }, [isOpen]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/supervisor/technicians');
      if (!response.ok) throw new Error('Failed to fetch technicians');
      const data = await response.json();
      setTechnicians(data);
    } catch (err) {
      setError('Failed to load technicians');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssign(selectedTechnician);
      onClose();
    } catch (err) {
      setError('Failed to assign ticket');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40" aria-hidden="true" />
      <div className="relative z-50 bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Panel data-testid="assignment-dialog">
          <Dialog.Title className="text-lg font-medium mb-4">
            Assign Ticket {ticketId ? `- ${ticketId}` : ''}
          </Dialog.Title>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 mb-4">{error}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Technician
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  data-testid="technician-select"
                >
                  <option value="">Choose a technician</option>
                  {technicians.map((tech) => (
                    <option 
                      key={tech.id} 
                      value={tech.id}
                      disabled={tech.status === 'Busy'}
                    >
                      {tech.name} ({tech.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="assign-button"
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          )}
          </Dialog.Panel>
      </div>
    </Dialog>
  );
}