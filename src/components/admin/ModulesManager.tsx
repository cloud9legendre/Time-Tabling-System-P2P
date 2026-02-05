import React, { useState } from 'react';
import { useModules } from '../../hooks/useSharedState';
import { useAdminActions } from '../../hooks/useAdminActions';
import type { Module } from '../../types/schema';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export const ModulesManager: React.FC = () => {
    const modules = useModules();
    const { addModule, updateModule, deleteModule } = useAdminActions();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Module>>({
        code: '',
        title: '',
        semester: 1
    });
    const [error, setError] = useState('');

    const openCreateModal = () => {
        setEditingModule(null);
        setFormData({ code: '', title: '', semester: 1 });
        setIsModalOpen(true);
        setError('');
    };

    const openEditModal = (mod: Module) => {
        setEditingModule(mod);
        setFormData({ ...mod });
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.code || !formData.title || !formData.semester) {
            setError('Please fill in all required fields.');
            return;
        }

        const moduleData = formData as Module;

        try {
            if (editingModule) {
                updateModule(moduleData);
            } else {
                addModule(moduleData);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 bg-[#1a1a1a] text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Modules</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add Module
                </button>
            </div>

            <div className="space-y-3">
                {modules.map((mod) => (
                    <div key={mod.code} className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-purple-400 font-mono">{mod.code}</h3>
                                <div className="bg-gray-700 text-xs px-2 py-0.5 rounded text-gray-300">Sem {mod.semester}</div>
                            </div>
                            <div className="text-gray-300 mt-1">{mod.title}</div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => openEditModal(mod)}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${mod.code}?`)) {
                                        try {
                                            deleteModule(mod.code);
                                        } catch (e: any) {
                                            alert(e.message);
                                        }
                                    }
                                }}
                                className="p-2 bg-red-900/50 hover:bg-red-900/80 rounded text-red-200 transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
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
                            <h3 className="text-xl font-bold">{editingModule ? 'Edit Module' : 'Add New Module'}</h3>
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
                                <label className="block text-sm text-gray-400 mb-1">Module Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                                    placeholder="e.g. CS101"
                                    disabled={!!editingModule}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Module Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    placeholder="e.g. Introduction to Programming"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Semester</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                {editingModule ? 'Update Module' : 'Create Module'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
