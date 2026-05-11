import React, { useState, useEffect } from 'react';
import { getPinterestAuthUrl, getPinterestBoards, PinterestBoard } from '../services/pinterestService';
import type { PinterestSettings, ToastType, ToastMessage } from '../types';

interface PinterestSettingsProps {
    settings: PinterestSettings;
    setSettings: (settings: PinterestSettings) => void;
    showToast: (config: string | ToastMessage, type?: ToastType) => void;
}

export const PinterestSettingsComponent: React.FC<PinterestSettingsProps> = ({ settings, setSettings, showToast }) => {
    const [boards, setBoards] = useState<PinterestBoard[]>([]);
    const [isLoadingBoards, setIsLoadingBoards] = useState(false);

    useEffect(() => {
        if (settings.token) {
            setIsLoadingBoards(true);
            getPinterestBoards(settings.token)
                .then(b => {
                    // Use a Map to ensure unique boards by ID to prevent duplicates if API returns them
                    const boardMap = new Map();
                    b.forEach(board => boardMap.set(board.id, board));
                    const uniqueBoards = Array.from(boardMap.values());
                    setBoards(uniqueBoards);
                })
                .catch(err => {
                    showToast('Failed to load Pinterest boards. Your token might be expired.', 'error');
                    console.error(err);
                })
                .finally(() => setIsLoadingBoards(false));
        }
    }, [settings.token, showToast]);

    const handleConnectClick = () => {
        try {
            const url = getPinterestAuthUrl();
            const width = 500;
            const height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            const authWindow = window.open(url, 'pinterest_oauth', `width=${width},height=${height},left=${left},top=${top}`);
            
            if (!authWindow) {
                showToast('Please allow popups to connect to Pinterest', 'error');
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Error starting OAuth', 'error');
        }
    };

    const handleDisconnect = () => {
        setSettings({ ...settings, token: null, boardId: null, autoPost: false });
        setBoards([]);
        showToast('Pinterest disconnected.', 'success');
    };

    return (
        <div className="space-y-8 animate-fadeInUp">
            <div>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Pinterest Auto-Post Settings</h3>
                <p className="text-sm text-slate-500 mt-2">Automatically publish a Pin when you generate a new recipe post.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                {!settings.token ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">Connect your Pinterest account to enable auto-posting.</p>
                        <button
                            onClick={handleConnectClick}
                            className="bg-red-600 text-white font-semibold py-2 px-6 rounded hover:bg-red-700 transition"
                        >
                            Connect Pinterest
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                            <div>
                                <span className="text-green-600 font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Pinterest Connected
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleConnectClick}
                                    className="text-teal-600 hover:text-teal-800 text-sm font-medium transition"
                                >
                                    Reauthorize
                                </button>
                                <button 
                                    onClick={handleDisconnect} 
                                    className="text-slate-500 hover:text-red-600 text-sm font-medium transition"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoPost}
                                    onChange={(e) => setSettings({ ...settings, autoPost: e.target.checked })}
                                    className="form-checkbox h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 transition-shadow"
                                />
                                <span className="text-slate-700 font-medium">Enable Auto-Posting to Pinterest</span>
                            </label>
                            <p className="text-xs text-slate-500 mt-1 ml-8">When a recipe is published to WordPress, a corresponding pin will be added to the selected board.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Target Board</label>
                            <select
                                value={settings.boardId || ''}
                                onChange={(e) => setSettings({ ...settings, boardId: e.target.value })}
                                className="w-full mt-1 px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                disabled={isLoadingBoards}
                            >
                                <option value="" disabled>-- Select a Board --</option>
                                {isLoadingBoards ? <option value="">Loading boards...</option> : boards.map(board => (
                                    <option key={board.id} value={board.id}>{board.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Pin Description Template</label>
                            <p className="text-xs text-slate-500 mb-2">Use <code className="bg-slate-200 px-1 rounded">{'{title}'}</code> and <code className="bg-slate-200 px-1 rounded">{'{description}'}</code> as placeholders. Our AI will automatically enhance this and add hashtags.</p>
                            <textarea
                                value={settings.descriptionTemplate}
                                onChange={(e) => setSettings({ ...settings, descriptionTemplate: e.target.value })}
                                rows={3}
                                className="w-full mt-1 px-4 py-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm leading-relaxed tracking-wide"
                                placeholder="..."
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
