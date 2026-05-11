
import React, { useState, useEffect } from 'react';
import type { User, ToastType } from '../types';
import { Icons } from '../constants';
import * as authService from '../services/authService';

interface SecuritySettingsProps {
  currentUser: User;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  showToast: (message: string, type?: ToastType) => void;
}

const TwoFactorSetupModal: React.FC<{
    onClose: () => void;
    onEnabled: () => void;
    showToast: (message: string, type?: ToastType) => void;
    userId: string;
}> = ({ onClose, onEnabled, showToast, userId }) => {
    const [secretKey, setSecretKey] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoading(true);
        // In a real app, this would be a call to a backend to generate a real TOTP secret.
        authService.enable2FA(userId).then(secret => {
            setSecretKey(secret);
            setIsLoading(false);
        }).catch(err => {
            setError('Could not generate a new 2FA secret. Please try again.');
            setIsLoading(false);
        });
    }, [userId]);

    const handleVerify = () => {
        // This is a simulation. A real app would verify the TOTP code against the secret on the server.
        if (verificationCode === '123456') {
            showToast('2FA enabled successfully!', 'success');
            onEnabled();
            onClose();
        } else {
            setError('Invalid verification code. Please try again.');
        }
    };
    
     const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Secret key copied!', 'success');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Enable Two-Factor Authentication</h2>
                <p className="text-sm text-slate-600 mb-4">Scan the QR code with your authenticator app (like Google Authenticator or Authy), then enter the code to verify.</p>
                {isLoading && <div className="text-center p-8">Loading...</div>}
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                
                {!isLoading && !error && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 border rounded-lg flex justify-center">
                           {/* Placeholder for QR code */}
                           <svg className="w-40 h-40 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="M148 56v20h20V56Zm-24 20h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4H84v-4H68v-4H52v-4H36V36H20V20h16v16h16v12h12v4h4v4h4v4h4v4h4v4h4v4h4v4h4v4h12v-4h4v-4h4v-4h4V56h-4v4h-4v4h-4v4h-4v4Zm56 0v20h20V56Zm-20 4h12v12h-12Zm-32-4v-4h-4v-4h-4v-4h-4v4h-4v4h-4v4h-4v4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4H88v-4h12V36h12v16h4v-4h4v-4h4v-4h4v-4h-4v-4h4v-4h-4v-4h-4V36h4V20h16v16h-4v12h-4v4h-4v4h-4v4h4v4h4v4h4v4h4v4h-4v4h-4v-4h-4Zm-4-32h-4v-4h-4V36h4v4h4Zm-8 8h-4V56h-4v4h4v4h4Zm8 8h-4v-4h-4v-4h4v-4h4ZM64 100H48V84h4v12h12Zm84 0v16h-4v12h-4v4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h4v-4h4v4h4v4h4v4h4v4h4v-4h4v-4h-4v-4h-4v4h-4v4h-4v-4h-4v4h-4v4Zm60 0h12v16h-16v-4h-4v-4h4v-4h4Zm-8-20v-4h-4v-4h-4v-4h4v-4h4v-4h4v-4h4v-4h4v-4h4v-4h4V36h16v16h-4v12h-4v4h-4v4h-4v4h-4v4h4v-4h4Zm-44 52v-4h-4v-4h-4v4h-4v4h-4v4h-4v4h4v-4h4v-4h4v-4h4v-4h4v4h-4v-4h-4v-4h-4v4h-4v-4h-4v-4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v4h4v4h4v4h4v4h4v-4h4v-4h4v4h-4v4h-4v4h4v4h4v4h4v4h-4v4h-4v-4h4v-4h4v4h-4v4h4v4h4v4h4v4h4v-4h4v-4h4v-4h4v-4h4Zm8 8h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v4h-4v4h-4v4h-4v-4h-4v4h4v4h4v4h4v4h4v4h4v4h4v4h4v4h-4v4h-4v-4h4v-4Zm36 12h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm-8 4h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm0-8h-4v-4h4Zm8-8h-4v-4h4Zm8-8h-4v-4h4Zm8-4h-4v-4h4Zm12 0h-4v-4h4Zm-44 140v16H36v-16h16v-4h4v-4h4v-4h4v-4h4v-4h4v-4h4v4h4v4h4v4h4v4h4v4h4v4h-4v4h-4v-4h-4v-4h-4v-4h-4v-4h-4v-4h-4v4h-4v4h-4v4h-4v4h-4v4h-4v4h4v4h4v-4h4v-4h4v4h4v-4h4v-4h4v-4h4v4h4v-4h4v4h-4v4Zm-8-8v12h-4v4h-4v-4h-4v-4h-4v4h-4v-4h-4v-4h-4v-4h-4v-4h4v-4h4v4h4v4h4v-4h4v4h4v4h4v4Zm-56 24v16H20v-16Zm200 0v16h-16v-16Zm-20 20v16h-16v-16Zm-20 0h-16v-16h16Zm-20-20v-16h-16v16Zm-20-20v-16h-16v16Zm-20-20v-16h-16v16Zm-20-20v-16h-16v16Zm-20-20v-16h-16v16Zm-20-20v-16h-16v16Z"/></svg>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-sm">Or enter this key manually:</p>
                            <div className="mt-2 flex justify-center items-center gap-2">
                                <code className="px-3 py-1.5 bg-slate-100 border-slate-300 border rounded-md font-mono text-slate-800">{secretKey}</code>
                                <button onClick={() => copyToClipboard(secretKey)} className="p-2 text-slate-500 hover:text-teal-600 rounded-full hover:bg-slate-200">
                                    {Icons.copy}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="2fa-code-verify" className="block text-sm font-medium text-slate-700">Verification Code</label>
                            <input
                                id="2fa-code-verify"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="button" onClick={handleVerify} disabled={isLoading || !verificationCode} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:bg-slate-400">
                        Verify & Enable
                    </button>
                </div>
            </div>
        </div>
    );
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ currentUser, onUpdateUser, showToast }) => {
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    
    const handleDisable2FA = async () => {
        if (window.confirm("Are you sure you want to disable two-factor authentication? This will reduce your account's security.")) {
            try {
                await authService.disable2FA(currentUser.id);
                // The onUpdateUser call will trigger a state update in the App component
                onUpdateUser(currentUser.id, { twoFactorEnabled: false, twoFactorSecret: undefined });
                showToast("Two-factor authentication has been disabled.", "success");
            } catch (error) {
                 showToast(error instanceof Error ? error.message : "Failed to disable 2FA.", "error");
            }
        }
    };
    
    const handleEnableSuccess = () => {
        // Trigger a re-render in the parent component to get the updated user state
         onUpdateUser(currentUser.id, { twoFactorEnabled: true });
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Security</h2>
                <p className="text-slate-500 mt-1">Manage your account's security settings.</p>
            </div>
            <div className="mt-6 p-6 bg-white rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Add an extra layer of security to your account. When you log in, you'll need to provide a code from your authenticator app.
                </p>
                <div className="mt-4">
                    {currentUser.twoFactorEnabled ? (
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                {React.cloneElement(Icons.shieldCheck, {className: "h-6 w-6 text-green-600"})}
                                <p className="font-semibold text-green-800">2FA is enabled</p>
                            </div>
                            <button onClick={handleDisable2FA} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm">
                                Disable
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                             <div className="flex items-center gap-3">
                                {React.cloneElement(Icons.shieldExclamation, {className: "h-6 w-6 text-slate-500"})}
                                <p className="font-semibold text-slate-700">2FA is disabled</p>
                            </div>
                            <button onClick={() => setIsSetupModalOpen(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm">
                                Enable 2FA
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {isSetupModalOpen && (
                <TwoFactorSetupModal 
                    onClose={() => setIsSetupModalOpen(false)}
                    onEnabled={handleEnableSuccess}
                    showToast={showToast}
                    userId={currentUser.id}
                />
            )}
        </div>
    );
};
