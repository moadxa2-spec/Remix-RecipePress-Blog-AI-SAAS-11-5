
import React from 'react';
import { Icons } from '../constants';
import type { User, ToastType } from '../types';

interface ReferralSettingsProps {
    currentUser: User;
    showToast: (message: string, type?: ToastType) => void;
}

export const ReferralSettings: React.FC<ReferralSettingsProps> = ({ currentUser, showToast }) => {

    const handleCopyCode = () => {
        navigator.clipboard.writeText(currentUser.referralCode);
        showToast('Referral code copied to clipboard!', 'success');
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Refer a Friend</h2>
                <p className="text-slate-500 mt-1">
                    Share your code with friends. When they sign up, you'll earn bonus article generations!
                </p>
            </div>
            <div className="mt-6 p-6 bg-teal-50 border border-teal-200 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-teal-800">Invite a friend and get 10 free articles.</h3>
                <p className="text-teal-700 mt-2">Share your personal referral code below:</p>
                <div className="mt-4 flex justify-center items-center gap-2">
                    <div className="px-6 py-3 bg-white border-2 border-dashed border-teal-300 rounded-lg text-2xl font-bold font-mono text-teal-900">
                        {currentUser.referralCode}
                    </div>
                    <button onClick={handleCopyCode} className="p-3 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100">
                        {React.cloneElement(Icons.copy, { className: "h-6 w-6 text-slate-600"})}
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t">
                <h3 className="text-xl font-bold text-slate-900">Your Bonuses</h3>
                <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <p className="font-medium text-slate-700">Available Bonus Articles:</p>
                    <p className="text-2xl font-bold text-teal-600">{currentUser.bonusArticles}</p>
                </div>
            </div>
        </div>
    );
};
