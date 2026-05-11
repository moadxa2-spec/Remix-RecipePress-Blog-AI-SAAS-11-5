import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityLog, User } from '../../types';

interface ActivityLogViewerProps {
    logs: ActivityLog[];
    users: User[];
}

const LogEntryItem: React.FC<{ entry: ActivityLog }> = ({ entry }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getActionStyle = (action: string) => {
        if (action.includes('fail')) return 'bg-red-100 text-red-800';
        if (action.includes('delete') || action.includes('remove')) return 'bg-orange-100 text-orange-800';
        if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-800';
        if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-800';
        return 'bg-slate-100 text-slate-800';
    };

    return (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${getActionStyle(entry.action)}`}>
                            {entry.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <p className="text-sm text-slate-800 font-medium truncate" title={entry.details}>
                            <span className="font-bold">{entry.actorName}</span>
                            {entry.details ? `: ${entry.details}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    <span className="text-xs text-slate-500" title={new Date(entry.timestamp).toLocaleString()}>
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};


export const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ logs, users }) => {
    const [filters, setFilters] = useState({ actorId: 'all', action: '' });

    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => filters.actorId === 'all' || log.actorId === filters.actorId)
            .filter(log => {
                const term = filters.action.toLowerCase();
                if (!term) return true;
                return log.action.toLowerCase().includes(term) || (log.details && log.details.toLowerCase().includes(term));
            });
    }, [logs, filters]);
    
    const uniqueActors = useMemo(() => {
       const actors = new Map<string, { id: string; name: string }>();
       logs.forEach(log => {
           if (!actors.has(log.actorId)) {
               actors.set(log.actorId, { id: log.actorId, name: log.actorName });
           }
       });
       return Array.from(actors.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [logs]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Activity Logs</h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border rounded-lg mb-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor="actor-filter" className="sr-only">Filter by User</label>
                    <select
                        id="actor-filter"
                        value={filters.actorId}
                        onChange={(e) => setFilters(prev => ({ ...prev, actorId: e.target.value }))}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="all">All Users</option>
                        {uniqueActors.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:flex-grow">
                     <label htmlFor="action-filter" className="sr-only">Search Actions or Details</label>
                     <input 
                        type="text"
                        id="action-filter"
                        placeholder="Search actions or details..." 
                        value={filters.action}
                        onChange={(e) => setFilters(prev => ({...prev, action: e.target.value}))}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => <LogEntryItem key={log.id} entry={log} />)
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <h3 className="text-lg font-semibold text-slate-800">No activity logs found.</h3>
                        <p className="mt-1 text-sm">Logs will appear here as actions are performed in the app.</p>
                    </div>
                )}
            </div>
        </div>
    );
};