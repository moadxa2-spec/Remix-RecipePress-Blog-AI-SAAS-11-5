import React, { useState } from 'react';
import type { AutomationsSettings, ToastType, User } from '../../types';

interface AutomationManagerProps {
    settings: AutomationsSettings;
    onSave: (settings: AutomationsSettings) => void;
    showToast: (message: string, type?: ToastType) => void;
    currentUser: User;
}

const Toggle: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}> = ({ label, description, enabled, onChange, disabled = false }) => (
    <div className="flex items-start justify-between">
        <div>
            <h4 className={`font-semibold text-slate-800 ${disabled ? 'text-slate-400' : ''}`}>{label}</h4>
            <p className={`text-sm text-slate-500 ${disabled ? 'text-slate-400' : ''}`}>{description}</p>
        </div>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            disabled={disabled}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                enabled ? 'bg-teal-600' : 'bg-slate-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow transform ring-0 transition ease-in-out duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

export const AutomationManager: React.FC<AutomationManagerProps> = ({ settings, onSave, showToast, currentUser }) => {
    const [formState, setFormState] = useState<AutomationsSettings>(settings);
    
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    const handleToggleChange = (key: keyof AutomationsSettings, value: boolean) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, inactiveUserThresholdDays: Number(e.target.value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Automations</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
                Configure automated tasks to run in the background to help manage your platform.
            </p>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Toggle
                        label="Auto-Cleanup Expired Keys"
                        description="Automatically set the status of expired keys to 'expired'."
                        enabled={formState.autoDeleteExpiredKeys}
                        onChange={(val) => handleToggleChange('autoDeleteExpiredKeys', val)}
                        disabled={!canManage}
                    />
                    
                    <Toggle
                        label="Auto-Reward Referrals"
                        description="Automatically grant bonus articles when a referred user upgrades to Pro."
                        enabled={formState.autoRewardReferrals}
                        onChange={(val) => handleToggleChange('autoRewardReferrals', val)}
                        disabled={!canManage}
                    />
                    
                    <div className="border-t pt-6">
                        <Toggle
                            label="Send Inactivity Reminders"
                            description="Send a one-time notification to users who haven't logged in for a while."
                            enabled={formState.sendInactiveReminders}
                            onChange={(val) => handleToggleChange('sendInactiveReminders', val)}
                            disabled={!canManage}
                        />
                        <div className={`mt-4 pl-16 transition-opacity duration-300 ${formState.sendInactiveReminders ? 'opacity-100' : 'opacity-50'}`}>
                            <label htmlFor="inactiveDays" className="block text-sm font-medium text-slate-700">
                                Send reminder after (days)
                            </label>
                            <input
                                type="number"
                                id="inactiveDays"
                                value={formState.inactiveUserThresholdDays}
                                onChange={handleInputChange}
                                min="1"
                                max="365"
                                disabled={!formState.sendInactiveReminders || !canManage}
                                className="mt-1 block w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm disabled:bg-slate-100"
                            />
                        </div>
                    </div>
                </div>

                {canManage && (
                    <div className="flex justify-end pt-6 mt-6 border-t">
                        <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            Save Automation Settings
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
