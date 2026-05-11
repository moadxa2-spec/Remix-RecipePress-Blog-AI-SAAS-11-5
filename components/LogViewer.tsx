

import React, { useState, useEffect, useCallback } from 'react';
import { getLogs, clearLogs } from '../services/loggingService';
import type { LogEntry, ToastType } from '../types';
import { Spinner } from './Spinner';
import { Icons } from '../constants';

interface LogViewerProps {
    showToast: (message: string, type?: ToastType) => void;
}

const LogEntryItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isError = entry.status && entry.status >= 400 || !!entry.error;
    const statusColor = isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    const statusText = entry.status ? `${entry.status}` : (isError ? 'Error' : 'OK');

    return (
        <div className="border border-slate-200 rounded-lg bg-white">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors gap-2 sm:gap-4 rounded-t-lg">
                <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${statusColor}`}>{statusText}</span>
                    <span className="font-mono text-sm text-slate-800 font-semibold truncate flex-shrink min-w-0">{entry.method} {entry.endpoint}</span>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>{React.cloneElement(Icons.arrowDown, {className: "h-5 w-5 text-slate-400"})}</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm rounded-b-lg">
                    {entry.requestPayload && (
                        <div>
                            <h4 className="font-semibold text-slate-700">Request Payload:</h4>
                            <pre className="mt-1 p-2 bg-white border rounded-md whitespace-pre-wrap text-xs font-mono">
                                {JSON.stringify(entry.requestPayload, null, 2)}
                            </pre>
                        </div>
                    )}
                    {entry.response && (
                        <div className="mt-3">
                            <h4 className="font-semibold text-slate-700">Response:</h4>
                            <pre className="mt-1 p-2 bg-white border rounded-md whitespace-pre-wrap text-xs font-mono">
                                {JSON.stringify(entry.response, null, 2)}
                            </pre>
                        </div>
                    )}
                    {entry.error && (
                         <div className="mt-3">
                            <h4 className="font-semibold text-red-700">Error Details:</h4>
                            <pre className="mt-1 p-2 bg-red-50 text-red-800 border border-red-200 rounded-md whitespace-pre-wrap text-xs font-mono">
                                {entry.error}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export const LogViewer: React.FC<LogViewerProps> = ({ showToast }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(() => {
        setIsLoading(true);
        const fetchedLogs = getLogs();
        setLogs(fetchedLogs);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleClearLogs = () => {
        if (window.confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
            clearLogs();
            setLogs([]);
            showToast('Logs cleared successfully.', 'success');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">App Logs</h2>
                <p className="text-slate-500 mt-1">
                    Shows the latest 100 API calls from this app to your WordPress sites. Logs are stored in your browser.
                </p>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={fetchLogs} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button onClick={handleClearLogs} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:bg-slate-400 transition-colors shadow-sm">
                    {React.cloneElement(Icons.trash, {className: "h-4 w-4"})}
                    <span>Clear Logs</span>
                </button>
            </div>
            
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Spinner />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 border-2 border-dashed rounded-lg">
                        <div className="inline-block p-4 bg-slate-100 rounded-full">{React.cloneElement(Icons.code, {className: "h-8 w-8 text-slate-400", strokeWidth: 1.5})}</div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">No logs found</h3>
                        <p className="mt-1 text-sm">Perform some actions in the app to generate logs.</p>
                    </div>
                ) : (
                    logs.map(log => <LogEntryItem key={log.id} entry={log} />)
                )}
            </div>
        </div>
    );
};
