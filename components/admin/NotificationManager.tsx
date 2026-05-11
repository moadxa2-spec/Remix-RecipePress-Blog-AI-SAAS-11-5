import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../../constants';
import type { Notification, User, ToastType } from '../../types';

interface NotificationManagerProps {
    allNotifications: Notification[];
    users: User[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'stats' | 'read'>) => void;
    deleteNotification: (ids: string[]) => void;
    showToast: (message: string, type?: ToastType) => void;
    currentUser: User;
}

const NotificationModal: React.FC<{
    onClose: () => void;
    onSave: (notification: Omit<Notification, 'id' | 'timestamp' | 'stats' | 'read'>) => void;
}> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState<'all' | 'free' | 'pro'>('all');
    const [schedule, setSchedule] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            alert('Title and message cannot be empty.');
            return;
        }

        const scheduledDate = schedule ? new Date(schedule) : null;
        if (scheduledDate && scheduledDate < new Date()) {
            alert('Scheduled time cannot be in the past.');
            return;
        }

        onSave({
            title,
            message,
            type: 'info',
            status: scheduledDate ? 'scheduled' : 'sent',
            targetGroup,
            scheduledAt: scheduledDate ? scheduledDate.toISOString() : null,
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeInUp">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create Notification</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="notif-title" className="block text-sm font-medium text-slate-700">Title</label>
                        <input type="text" id="notif-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="notif-message" className="block text-sm font-medium text-slate-700">Message</label>
                        <textarea id="notif-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="notif-target" className="block text-sm font-medium text-slate-700">Target Group</label>
                            <select id="notif-target" value={targetGroup} onChange={e => setTargetGroup(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                <option value="all">All Users</option>
                                <option value="free">Free Users</option>
                                <option value="pro">Pro Users</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="notif-schedule" className="block text-sm font-medium text-slate-700">Schedule (Optional)</label>
                            <input type="datetime-local" id="notif-schedule" value={schedule} onChange={e => setSchedule(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">{schedule ? 'Schedule' : 'Send Now'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: Notification['status'] }> = ({ status }) => {
    const styles = {
        sent: "bg-green-100 text-green-800",
        scheduled: "bg-blue-100 text-blue-800",
        draft: "bg-slate-100 text-slate-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[status]}`}>{status}</span>;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ allNotifications, addNotification, deleteNotification, currentUser }) => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [notifications, setNotifications] = useState(allNotifications);
    
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    useEffect(() => {
      setNotifications(allNotifications);
    }, [allNotifications]);
    
    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => statusFilter === 'all' || n.status === statusFilter)
            .filter(n => 
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications, searchTerm, statusFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleSelectOne = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0 || !canManage) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} notification(s)?`)) {
            deleteNotification(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Notifications Management</h2>
                    {canManage && (
                        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-semibold text-sm flex items-center gap-2">
                            {Icons.add} <span>Create Notification</span>
                        </button>
                    )}
                </div>
                
                {/* Filters and Bulk Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 bg-slate-50 border rounded-t-lg">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search title or message..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                         <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="sent">Sent</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>
                    <div>
                        {selectedIds.size > 0 && canManage && (
                             <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 border border-red-200 rounded-md hover:bg-red-200">
                                {React.cloneElement(Icons.trash, {className: "h-4 w-4"})} Delete ({selectedIds.size})
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border-x border-b rounded-b-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" 
                                      disabled={!canManage}
                                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:bg-slate-200"
                                      onChange={handleSelectAll}
                                      checked={selectedIds.size > 0 && selectedIds.size === filteredNotifications.length}
                                      ref={el => {
                                        if (el) {
                                            el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredNotifications.length;
                                        }
                                      }}
                                    />
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Title / Message</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Target</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Stats</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredNotifications.map(n => (
                                <tr key={n.id}>
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:bg-slate-200" disabled={!canManage} checked={selectedIds.has(n.id)} onChange={() => handleSelectOne(n.id)} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap max-w-xs">
                                        <div className="font-medium text-slate-900 truncate" title={n.title}>{n.title}</div>
                                        <div className="text-sm text-slate-500 truncate" title={n.message}>{n.message}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={n.status} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 capitalize">{n.targetGroup}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{new Date(n.scheduledAt || n.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{n.stats.sent.toLocaleString()} Sent</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => deleteNotification([n.id])} disabled={!canManage} className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed">{React.cloneElement(Icons.trash, {className: "h-5 w-5"})}</button>
                                    </td>
                                </tr>
                            ))}
                             {filteredNotifications.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">No matching notifications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <NotificationModal onClose={() => setShowModal(false)} onSave={addNotification} />}
        </>
    );
};