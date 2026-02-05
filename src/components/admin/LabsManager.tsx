import React, { useState } from 'react';
import { useLabs } from '../../hooks/useSharedState';
import { useAdminActions } from '../../hooks/useAdminActions';
import type { Lab } from '../../types/schema';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export const LabsManager: React.FC = () => {
    const labs = useLabs();
    const { addLab, updateLab, deleteLab } = useAdminActions();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Lab>>({
        id: '',
        name: '',
        department: '',
        capacity: 0,
        is_active: true
    });
    const [error, setError] = useState('');

    const openCreateModal = () => {
        setEditingLab(null);
        setFormData({ id: '', name: '', department: '', capacity: 0, is_active: true });
        setIsModalOpen(true);
        setError('');
    };

    const openEditModal = (lab: Lab) => {
        setEditingLab(lab);
        setFormData({ ...lab });
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.id || !formData.name || !formData.department) {
            setError('Please fill in all required fields.');
            return;
        }

        const labData = formData as Lab;

        try {
            if (editingLab) {
                // Edit
                updateLab(labData);
            } else {
                // Create
                addLab(labData);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 bg-[#1a1a1a] text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Labs</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add Lab
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.map((lab) => (
                    <div key={lab.id} className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700 shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-blue-400">{lab.name}</h3>
                                <div className="text-sm text-gray-400 mt-1">ID: {lab.id}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${lab.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {lab.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-gray-300">
                            <div className="flex justify-between">
                                <span>Dept:</span>
                                <span className="font-medium">{lab.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Capacity:</span>
                                <span className="font-medium">{lab.capacity}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => openEditModal(lab)}
                                className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${lab.name}?`)) {
                                        try {
                                            deleteLab(lab.id);
                                        } catch (e: any) {
                                            alert(e.message);
                                        }
                                    }
                                }}
                                className="flex-1 flex justify-center items-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-200 py-2 rounded transition-colors"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#2a2a2a] rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h3 className="text-xl font-bold">{editingLab ? 'Edit Lab' : 'Add New Lab'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {error && (
                                <div className="bg-red-900/50 text-red-200 p-3 rounded text-sm border border-red-800">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Lab ID (Auto-generated/Unique)</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. lab-01"
                                    disabled={!!editingLab} // ID not editable once created
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Computer Lab A"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. CS"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="is_active" className="text-gray-300">Active (Available for booking)</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                {editingLab ? 'Update Lab' : 'Create Lab'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
