
import React, { useState, useRef } from 'react';
import { Icons } from '../../constants';
import type { ToastType } from '../../types';
import { Spinner } from '../Spinner';

interface BackupManagerProps {
    showToast: (message: string, type?: ToastType) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ showToast }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        try {
            const allData: { [key: string]: any } = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('recipepress-')) {
                    allData[key] = localStorage.getItem(key);
                }
            }
            
            // Parse and re-stringify to ensure valid JSON and format it nicely
            const parsedData = Object.entries(allData).reduce((acc, [key, value]) => {
                try {
                    acc[key] = JSON.parse(value);
                } catch {
                    acc[key] = value;
                }
                return acc;
            }, {} as { [key: string]: any });

            const jsonString = JSON.stringify(parsedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `recipepress-backup-${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup created successfully!', 'success');
        } catch (error) {
            console.error("Backup failed:", error);
            showToast('Failed to create backup.', 'error');
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                showToast('Failed to read file.', 'error');
                return;
            }

            if (window.confirm('Are you sure you want to restore? This will overwrite all current application data.')) {
                setIsRestoring(true);
                try {
                    const data = JSON.parse(content);
                    
                    // Clear existing recipepress data
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('recipepress-')) {
                            localStorage.removeItem(key);
                        }
                    });

                    // Set new data
                    Object.entries(data).forEach(([key, value]) => {
                        if (key.startsWith('recipepress-')) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    });

                    showToast('Restore successful! The application will now reload.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    console.error("Restore failed:", error);
                    showToast('Restore failed. The file may be invalid.', 'error');
                    setIsRestoring(false);
                }
            }
        };
        reader.readAsText(file);
        
        // Reset file input to allow re-uploading the same file
        event.target.value = '';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Backup & Restore</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
                Download all application data into a single file or restore from a backup.
                This includes all users, sites, keys, and settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleBackup}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                    {Icons.upload}
                    Download Backup
                </button>
                <button
                    onClick={handleRestoreClick}
                    disabled={isRestoring}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 transition-colors"
                >
                    {isRestoring ? <Spinner size="h-5 w-5" /> : Icons.server}
                    Restore from Backup
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
             <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                <strong>Warning:</strong> Restoring will completely replace all current data. This action cannot be undone.
            </div>
        </div>
    );
};