import React, { useState, useEffect } from 'react';
import type { User, EditUserModalProps } from '../../types';
import { Spinner } from '../Spinner';

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave, currentUser, isSaving }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');
    const isNewUser = !user;

    const staffRoles: Array<User['role']> = ['support', 'admin'];
    const userRoles: Array<User['role']> = ['user', 'support', 'admin'];
    const ownerCanManageRoles = currentUser.role === 'owner' && user?.role !== 'owner';
    const isEditingSelf = user?.id === currentUser.id;

    useEffect(() => {
        if (isOpen) {
            if (user) {
                // Editing existing user
                setFormData(user);
            } else {
                // Reset for creating a new staff user
                setFormData({
                    name: '',
                    email: '',
                    plan: 'pro',
                    role: 'support',
                    status: 'active',
                });
                setPassword('');
            }
        }
    }, [user, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, isNewUser ? password : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeInUp" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{isNewUser ? 'Create New Staff User' : `Edit User: ${user?.name}`}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            id="user-name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            id="user-email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        />
                    </div>
                    {isNewUser && (
                        <div>
                            <label htmlFor="user-password" className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                id="user-password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                id="user-role"
                                name="role"
                                value={formData.role || 'user'}
                                onChange={handleChange}
                                disabled={!ownerCanManageRoles && !isNewUser}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md disabled:bg-slate-100 disabled:text-slate-500"
                            >
                               {isNewUser 
                                    ? staffRoles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)
                                    : userRoles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)
                               }
                               {user?.role === 'owner' && <option value="owner">Owner</option>}
                            </select>
                            {!ownerCanManageRoles && !isNewUser && <p className="text-xs text-slate-500 mt-1">Only the owner can change roles.</p>}
                        </div>
                        <div>
                            <label htmlFor="user-plan" className="block text-sm font-medium text-slate-700">Plan</label>
                            <select
                                id="user-plan"
                                name="plan"
                                value={formData.plan || 'free'}
                                onChange={handleChange}
                                disabled={formData.role === 'owner'}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md disabled:bg-slate-100"
                            >
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="user-status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select
                                id="user-status"
                                name="status"
                                value={formData.status || 'active'}
                                onChange={handleChange}
                                disabled={isEditingSelf}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md disabled:bg-slate-100"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="banned">Banned</option>
                            </select>
                             {isEditingSelf && <p className="text-xs text-slate-500 mt-1">You cannot change your own status.</p>}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:bg-slate-400">
                            {isSaving ? <Spinner size="h-5 w-5"/> : (isNewUser ? 'Create User' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
