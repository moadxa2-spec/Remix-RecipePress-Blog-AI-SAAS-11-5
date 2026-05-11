import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icons } from '../../constants';
import type { LicenseKey, ToastType, User } from '../../types';
import { exportLicenseKeysToCSV } from '../../utils/export';

interface LicenseKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: LicenseKey | Omit<LicenseKey, 'id' | 'key' | 'assignedTo' | 'assignedEmail' | 'createdAt'>) => void;
    editingKey: LicenseKey | null;
}

const LicenseKeyModal: React.FC<LicenseKeyModalProps> = ({ isOpen, onClose, onSave, editingKey }) => {
    const [keyData, setKeyData] = useState<Partial<LicenseKey>>({});

    useEffect(() => {
        if (editingKey) {
            setKeyData({
                ...editingKey,
                expiresAt: editingKey.expiresAt ? editingKey.expiresAt.split('T')[0] : '', // Format for date input
            });
        } else {
            setKeyData({
                type: 'pro',
                status: 'inactive',
                expiresAt: '',
                notes: '',
            });
        }
    }, [editingKey, isOpen]);
    
    useEffect(() => {
        if (keyData.type === 'special') {
            setKeyData(prev => ({ ...prev, expiresAt: '' }));
        }
    }, [keyData.type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setKeyData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...keyData,
            expiresAt: keyData.type === 'special' ? null : (keyData.expiresAt ? new Date(keyData.expiresAt).toISOString() : null)
        };
        onSave(dataToSave as LicenseKey);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeInUp" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{editingKey ? 'Edit License Key' : 'Create New License Key'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingKey && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Key</label>
                            <input type="text" readOnly value={keyData.key} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg shadow-sm font-mono text-sm text-slate-500" />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="key-type" className="block text-sm font-medium text-slate-700">Type</label>
                            <select id="key-type" name="type" value={keyData.type} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                <option value="pro">Pro</option>
                                <option value="unlimited">Unlimited</option>
                                <option value="special">Special</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="key-status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="key-status" name="status" value={keyData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="key-expires" className="block text-sm font-medium text-slate-700">Expires At (Optional)</label>
                        <input type="date" id="key-expires" name="expiresAt" value={keyData.expiresAt || ''} onChange={handleChange} disabled={keyData.type === 'special'} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label htmlFor="key-notes" className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
                        <textarea id="key-notes" name="notes" value={keyData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">Save Key</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: LicenseKey['status'] }> = ({ status }) => {
    const styles = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-slate-100 text-slate-800",
        expired: "bg-yellow-100 text-yellow-800",
        revoked: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[status]}`}>{status}</span>;
}

const TypeBadge: React.FC<{ type: LicenseKey['type'] }> = ({ type }) => {
    const styles = {
        pro: "bg-blue-100 text-blue-800",
        unlimited: "bg-indigo-100 text-indigo-800",
        special: "bg-slate-200 text-slate-800"
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${styles[type]}`}>{type}</span>;
}


const CopyButton: React.FC<{ textToCopy: string, showToast: (message: string, type?: ToastType) => void }> = ({ textToCopy, showToast }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        showToast('License key copied!');
        setTimeout(() => setCopied(false), 2000);
    };
    return (
         <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-md">
            {copied ? React.cloneElement(Icons.check, { className: 'h-5 w-5 text-green-500' }) : Icons.copy}
         </button>
    );
};


interface LicenseKeyManagerProps {
    licenseKeys: LicenseKey[];
    onCreateKey: (keyData: Omit<LicenseKey, 'id' | 'key' | 'assignedTo' | 'assignedEmail' | 'createdAt'>) => void;
    onUpdateKey: (key: LicenseKey) => void;
    onDeleteKeys: (keyIds: string[]) => void;
    showToast: (message: string, type?: ToastType) => void;
    currentUser: User;
}

export const LicenseKeyManager: React.FC<LicenseKeyManagerProps> = ({ licenseKeys, onCreateKey, onUpdateKey, onDeleteKeys, showToast, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<LicenseKey | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    const filteredKeys = useMemo(() => {
        return licenseKeys
            .filter(k => statusFilter === 'all' || k.status === statusFilter)
            .filter(k => typeFilter === 'all' || k.type === typeFilter)
            .filter(k => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return k.key.toLowerCase().includes(term) ||
                       k.notes.toLowerCase().includes(term) ||
                       (k.assignedEmail && k.assignedEmail.toLowerCase().includes(term));
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [licenseKeys, searchTerm, statusFilter, typeFilter]);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedIds.size;
            const numOnPage = filteredKeys.length;
            selectAllCheckboxRef.current.checked = numSelected > 0 && numSelected === numOnPage;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numOnPage;
        }
    }, [selectedIds, filteredKeys]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? new Set(filteredKeys.map(k => k.id)) : new Set());
    };

    const handleSelectOne = (id: string) => {
        const newSelection = new Set(selectedIds);
        newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
        setSelectedIds(newSelection);
    };

    const handleCreateNew = () => {
        setEditingKey(null);
        setIsModalOpen(true);
    };

    const handleEdit = (key: LicenseKey) => {
        setEditingKey(key);
        setIsModalOpen(true);
    };

    const handleSaveKey = (data: LicenseKey | Omit<LicenseKey, 'id' | 'key' | 'assignedTo' | 'assignedEmail' | 'createdAt'>) => {
        if ('id' in data) {
            onUpdateKey(data);
        } else {
            onCreateKey(data);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = (keyId: string) => {
        const key = licenseKeys.find(k => k.id === keyId);
        if (key?.status === 'active') {
             showToast('Cannot delete an active key. Please revoke it first.', 'error');
             return;
        }
        onDeleteKeys([keyId]);
    }
    
    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        onDeleteKeys(Array.from(selectedIds));
        setSelectedIds(new Set());
    };
    
    const handleExport = () => {
        exportLicenseKeysToCSV(filteredKeys, showToast);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-slate-800">License Key Management</h2>
                    <div className="flex gap-2">
                        <button onClick={handleExport} disabled={filteredKeys.length === 0} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold text-sm disabled:opacity-50">
                            Export CSV
                        </button>
                        {canManage && (
                            <button onClick={handleCreateNew} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-semibold text-sm flex items-center gap-2">
                                {Icons.add} <span>Create New Key</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 bg-slate-50 border rounded-t-lg">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search key, email, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                            <option value="revoked">Revoked</option>
                        </select>
                         <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500">
                            <option value="all">All Types</option>
                            <option value="pro">Pro</option>
                            <option value="unlimited">Unlimited</option>
                            <option value="special">Special</option>
                        </select>
                    </div>
                    <div>
                        {selectedIds.size > 0 && canManage && (
                            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 border border-red-200 rounded-md hover:bg-red-200">
                                {React.cloneElement(Icons.trash, { className: "h-4 w-4" })} Delete ({selectedIds.size})
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border-x border-b rounded-b-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} disabled={!canManage} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:bg-slate-200" /></th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Key</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Assigned To</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredKeys.map(k => (
                                <tr key={k.id} className={selectedIds.has(k.id) ? 'bg-teal-50/50' : ''}>
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:bg-slate-200" checked={selectedIds.has(k.id)} onChange={() => handleSelectOne(k.id)} disabled={!canManage} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm text-slate-700">{k.key}</span>
                                            <CopyButton textToCopy={k.key} showToast={showToast} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap"><TypeBadge type={k.type} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={k.status} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 truncate max-w-[200px]" title={k.assignedEmail}>{k.assignedEmail || '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {canManage && <>
                                            <button onClick={() => handleEdit(k)} className="text-teal-600 hover:text-teal-900">Edit</button>
                                            <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </>}
                                    </td>
                                </tr>
                            ))}
                            {filteredKeys.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">No matching license keys found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {canManage && <LicenseKeyModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveKey}
                editingKey={editingKey}
            />}
        </>
    );
};