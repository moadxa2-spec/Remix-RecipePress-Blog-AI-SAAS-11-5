import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../../constants';
import { Spinner } from '../Spinner';
import type { User, ToastType, ToastMessage } from '../../types';
import { EditUserModal } from './EditUserModal';
import { exportUsersToCSV } from '../../utils/export';

const UserStatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
    const styles = {
        active: "bg-green-100 text-green-800",
        suspended: "bg-yellow-100 text-yellow-800",
        banned: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[status]}`}>{status}</span>;
}

const PlanBadge: React.FC<{ plan: User['plan'] }> = ({ plan }) => {
    const styles = {
        free: "bg-slate-100 text-slate-800",
        pro: "bg-blue-100 text-blue-800",
    };
    const displayPlan = plan === 'pro' ? 'Pro' : 'Free';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[plan]}`}>{displayPlan}</span>;
}

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
    const styles = {
        user: "bg-gray-100 text-gray-800",
        support: "bg-cyan-100 text-cyan-800",
        admin: "bg-indigo-100 text-indigo-800",
        owner: "bg-purple-100 text-purple-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[role]}`}>{role}</span>;
}


interface UserManagerProps {
    users: User[];
    showToast: (config: string | ToastMessage, type?: ToastType) => void;
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    onDeleteUsers: (userIds: string[]) => void;
    onResetUserData: (userId: string) => void;
    onAdminCreateUser: (userData: Partial<User>, password?: string) => void;
    currentUser: User;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, showToast, onUpdateUser, onDeleteUsers, onResetUserData, onAdminCreateUser, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCreatingStaff, setIsCreatingStaff] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [actionMenu, setActionMenu] = useState<{ id: string; anchor: HTMLElement | null }>({ id: '', anchor: null });

    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => planFilter === 'all' || u.plan === planFilter)
            .filter(u => statusFilter === 'all' || u.status === statusFilter)
            .filter(u => roleFilter === 'all' || u.role === roleFilter)
            .filter(u => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
            });
    }, [users, searchTerm, planFilter, statusFilter, roleFilter]);
    
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedIds.size;
            const numOnPage = filteredUsers.filter(u => u.role !== 'owner').length;
            const numSelectedNotOwner = filteredUsers.filter(u => selectedIds.has(u.id) && u.role !== 'owner').length;
            selectAllCheckboxRef.current.checked = numSelected > 0 && numSelectedNotOwner === numOnPage;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelectedNotOwner < numOnPage;
        }
    }, [selectedIds, filteredUsers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenu({ id: '', anchor: null });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked 
            ? new Set(filteredUsers.filter(u => u.role !== 'owner').map(u => u.id)) 
            : new Set()
        );
    };

    const handleSelectOne = (id: string) => {
        const newSelection = new Set(selectedIds);
        newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
        setSelectedIds(newSelection);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsCreatingStaff(false);
        setIsModalOpen(true);
        setActionMenu({ id: '', anchor: null });
    };

    const handleAddStaff = () => {
        setEditingUser(null);
        setIsCreatingStaff(true);
        setIsModalOpen(true);
    };

    const handleSaveUser = (userData: Partial<User>, password?: string) => {
        if (isCreatingStaff) {
             const { name, email, role, plan } = userData;
             if (!name || !email || !role || !plan || !password) {
                 showToast('All fields including password are required for new staff.', 'error');
                 return;
             }
             onAdminCreateUser(userData, password);
        } else if (editingUser) {
            onUpdateUser(editingUser.id, userData);
        }
        setIsModalOpen(false);
        setIsCreatingStaff(false);
        setEditingUser(null);
    };

    const handleDelete = (user: User) => {
        setActionMenu({ id: '', anchor: null });
        if (window.confirm(`Are you sure you want to delete ${user.name}? This action is irreversible.`)) {
            onDeleteUsers([user.id]);
        }
    };
    
    const handleReset = (user: User) => {
        setActionMenu({ id: '', anchor: null });
        if (window.confirm(`Are you sure you want to reset all data for ${user.name}? This will delete their sites, posts, and settings, but not their account.`)) {
            onResetUserData(user.id);
        }
    };

    const handleBulkAction = (action: 'activate' | 'suspend' | 'ban' | 'delete') => {
        const userIds = Array.from(selectedIds);
        if(userIds.length === 0) return;
        
        if (action === 'delete') {
            if (window.confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
                onDeleteUsers(userIds);
            }
        } else {
             const statusMap = { 'activate': 'active', 'suspend': 'suspended', 'ban': 'banned' };
             const newStatus = statusMap[action];
             userIds.forEach(id => {
                const user = users.find(u => u.id === id);
                if (user?.role !== 'owner') { // Protect owner from bulk actions
                    onUpdateUser(id, { status: newStatus as User['status'] })
                }
             });
        }
        setSelectedIds(new Set());
    };
    
    const canPerformAction = useCallback((targetUser: User): boolean => {
        if (currentUser.role === 'support') return false;
        if (targetUser.role === 'owner') return false; // Cannot act on owner
        if (targetUser.id === currentUser.id) return false; // Cannot act on self
        if (currentUser.role === 'admin' && targetUser.role === 'admin') return false; // Admins cannot act on other admins
        return true;
    }, [currentUser]);

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                    <div className="flex items-center gap-2">
                        {currentUser.role === 'owner' && (
                            <button onClick={handleAddStaff} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-semibold text-sm flex items-center gap-2">
                                {Icons.add} <span>Add Staff</span>
                            </button>
                        )}
                        <button onClick={() => exportUsersToCSV(filteredUsers, showToast)} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold text-sm">
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters and Bulk Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 bg-slate-50 border rounded-lg mb-4">
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow sm:flex-grow-0 sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                         <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="support">Support</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                        </select>
                         <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                            <option value="all">All Plans</option>
                            <option value="pro">Pro</option>
                            <option value="free">Free</option>
                        </select>
                         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>

                {(selectedIds.size > 0 && (currentUser.role === 'owner' || currentUser.role === 'admin')) && (
                    <div className="p-3 mb-4 bg-teal-50 border border-teal-200 rounded-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeInUp">
                        <span className="text-sm font-semibold text-teal-800">{selectedIds.size} user(s) selected</span>
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <span className="text-sm font-medium text-slate-600">Change status to:</span>
                             <button onClick={() => handleBulkAction('activate')} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200">Active</button>
                             <button onClick={() => handleBulkAction('suspend')} className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200">Suspended</button>
                             <button onClick={() => handleBulkAction('ban')} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200">Banned</button>
                             <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700">
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}


                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" disabled={currentUser.role === 'support'} /></th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role / Plan</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Dates</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Stats</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className={`${user.role === 'owner' ? 'bg-purple-50' : ''} ${selectedIds.has(user.id) ? 'bg-teal-50/50' : ''}`}>
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" checked={selectedIds.has(user.id)} onChange={() => handleSelectOne(user.id)} disabled={!canPerformAction(user)} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap space-y-1">
                                        <div><RoleBadge role={user.role} /></div>
                                        <div><PlanBadge plan={user.plan} /></div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap"><UserStatusBadge status={user.status} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                        <div>Registered: {new Date(user.registeredAt).toLocaleDateString()}</div>
                                        <div>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                                    </td>
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                        <div>Posts: {user.postsGenerated}</div>
                                        <div>Bonus: {user.bonusArticles}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative inline-block text-left">
                                            <button 
                                                onClick={(e) => setActionMenu({ id: user.id, anchor: e.currentTarget })}
                                                disabled={!canPerformAction(user)}
                                                className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                            </button>
                                            {actionMenu.id === user.id && (
                                                <div ref={actionMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                        <a href="#" onClick={(e) => {e.preventDefault(); handleEdit(user)}} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Edit User</a>
                                                        <a href="#" onClick={(e) => {e.preventDefault(); handleReset(user)}} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Reset Data</a>
                                                        <a href="#" onClick={(e) => {e.preventDefault(); handleDelete(user)}} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete User</a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">No matching users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditUserModal 
                isOpen={isModalOpen}
                user={isCreatingStaff ? null : editingUser}
                onClose={() => {setIsModalOpen(false); setEditingUser(null);}}
                onSave={handleSaveUser}
                currentUser={currentUser}
                isSaving={false} // Placeholder for now
            />
        </>
    );
};