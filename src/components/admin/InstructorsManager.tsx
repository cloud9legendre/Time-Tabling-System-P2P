import React, { useState } from 'react';
import { useInstructors } from '../../hooks/useSharedState';
import { useAdminActions } from '../../hooks/useAdminActions';
import type { Instructor } from '../../types/schema';
import { Plus, Trash2, Edit2, X, User, AlertCircle } from 'lucide-react';
import { hashPassword } from '../../utils/crypto';

export const InstructorsManager: React.FC = () => {
    const instructors = useInstructors();
    const { addInstructor, updateInstructor, deleteInstructor } = useAdminActions();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Instructor> & { password?: string }>({
        id: '',
        name: '',
        email: '',
        department: '',
        password: ''
    });
    const [error, setError] = useState('');

    const openCreateModal = () => {
        setEditingInstructor(null);
        setFormData({ id: '', name: '', email: '', department: '', password: '' });
        setIsModalOpen(true);
        setError('');
    };

    const openEditModal = (inst: Instructor) => {
        setEditingInstructor(inst);
        setFormData({ ...inst });
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.id || !formData.name || !formData.email || !formData.department) {
            setError('Please fill in all required fields.');
            return;
        }

        const instructorData = formData as Instructor;

        try {
            if (editingInstructor) {
                // If checking for password update
                if (formData.password) {
                    const newHash = await hashPassword(formData.password);
                    instructorData.passwordHash = newHash;
                    instructorData.passwordResetRequested = undefined; // Clear request
                } else {
                    // Keep existing hash
                    instructorData.passwordHash = editingInstructor.passwordHash;
                }
                updateInstructor(instructorData);
            } else {
                if (!formData.password) {
                    setError('Initial password is required.');
                    return;
                }
                await addInstructor(instructorData, formData.password);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 bg-[#1a1a1a] text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Instructors</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add Instructor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructors.map((inst) => (
                    <div key={inst.id} className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-700 rounded-full">
                                <User size={24} className="text-gray-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-green-400">{inst.name}</h3>
                                <div className="text-sm text-gray-400 mt-1 font-mono">{inst.email}</div>
                                <div className="text-xs text-gray-500 mt-1">ID: {inst.id}</div>
                            </div>
                        </div>

                        {inst.passwordResetRequested && (
                            <div className="mt-3 bg-yellow-900/40 border border-yellow-700/50 rounded p-2 flex items-center gap-2 text-yellow-200 text-sm">
                                <AlertCircle size={16} />
                                <span>Password Reset Requested</span>
                            </div>
                        )}

                        <div className="mt-4 text-gray-300 border-t border-gray-700 pt-3">
                            <div className="flex justify-between">
                                <span>Department:</span>
                                <span className="font-medium">{inst.department}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => openEditModal(inst)}
                                className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${inst.name}?`)) {
                                        try {
                                            deleteInstructor(inst.id);
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
                            <h3 className="text-xl font-bold">{editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}</h3>
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
                                <label className="block text-sm text-gray-400 mb-1">Instructor ID (Unique)</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    placeholder="e.g. inst-01"
                                    disabled={!!editingInstructor}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    placeholder="e.g. john@university.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    placeholder="e.g. Computer Science"
                                />
                            </div>

                            {!editingInstructor ? (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Initial Password</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 font-mono"
                                        placeholder="Generate a generic password"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Share this with the instructor. They can change it after logging in.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Reset Password</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 font-mono"
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter a new value to reset the instructor's password.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                {editingInstructor ? 'Update Instructor' : 'Create Instructor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
