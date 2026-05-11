import React, { useState, useMemo } from 'react';
import type { AdminSettings, Referral, ToastType, User } from '../../types';
import { Icons } from '../../constants';
import { exportReferralsToCSV } from '../../utils/export';


interface ReferralManagerProps {
    referrals: Referral[];
    users: User[];
    adminSettings: AdminSettings;
    onSettingsChange: (settings: AdminSettings) => void;
    showToast: (message: string, type?: ToastType) => void;
    currentUser: User;
}

const ReferralSettings: React.FC<{
    settings: AdminSettings;
    onSettingsChange: (settings: AdminSettings) => void;
    canManage: boolean;
}> = ({ settings, onSettingsChange, canManage }) => {
    const [bonus, setBonus] = useState(settings.referralBonus);

    const handleSave = () => {
        onSettingsChange({ ...settings, referralBonus: bonus });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Referral Program Settings</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Define the rewards for successful referrals.</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="referral-bonus" className="block text-sm font-medium text-slate-700">Bonus Articles per Conversion</label>
                    <input
                        id="referral-bonus"
                        type="number"
                        value={bonus}
                        onChange={(e) => setBonus(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        disabled={!canManage}
                        className="mt-1 block w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm disabled:bg-slate-100"
                    />
                     <p className="mt-1 text-xs text-slate-500">The number of free articles a user gets when someone they referred signs up for a pro plan.</p>
                </div>
                {canManage && (
                    <button
                        onClick={handleSave}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                    >
                        Save Settings
                    </button>
                )}
            </div>
        </div>
    );
}


export const ReferralManager: React.FC<ReferralManagerProps> = ({ referrals, users, adminSettings, onSettingsChange, showToast, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [conversionFilter, setConversionFilter] = useState('all');

    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    const referralsWithEmails = useMemo(() => {
        const allUsersWithCurrent = [...users, currentUser]; // Include current user for self-referral lookup if needed
        return referrals.map(ref => {
            const referrer = allUsersWithCurrent.find(u => u.id === ref.referrerId);
            const referred = allUsersWithCurrent.find(u => u.id === ref.referredId);
            return {
                ...ref,
                referrerEmail: referrer?.email || 'N/A',
                referredEmail: referred?.email || 'N/A',
            }
        });
    }, [referrals, users, currentUser]);

    const filteredReferrals = useMemo(() => {
        return referralsWithEmails
            .filter(r => {
                if (conversionFilter === 'all') return true;
                return conversionFilter === 'converted' ? r.converted : !r.converted;
            })
            .filter(r => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return r.referrerName.toLowerCase().includes(term) ||
                       r.referredName.toLowerCase().includes(term) ||
                       r.referrerEmail.toLowerCase().includes(term) ||
                       r.referredEmail.toLowerCase().includes(term);
            });
    }, [referralsWithEmails, searchTerm, conversionFilter]);
    
    const handleExport = () => {
        exportReferralsToCSV(filteredReferrals, users, showToast);
    };

    return (
        <div className="space-y-8">
            <ReferralSettings settings={adminSettings} onSettingsChange={onSettingsChange} canManage={canManage} />
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Referral Tracking</h2>
                     <button onClick={handleExport} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold text-sm">
                        Export CSV
                    </button>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border rounded-t-lg">
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                     <select 
                        value={conversionFilter}
                        onChange={(e) => setConversionFilter(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="all">All Conversions</option>
                        <option value="converted">Converted</option>
                        <option value="not_converted">Not Converted</option>
                    </select>
                </div>

                <div className="overflow-x-auto border-x border-b rounded-b-lg">
                     <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Referred User</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Invited By</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                            {filteredReferrals.length > 0 ? filteredReferrals.map(ref => (
                                <tr key={ref.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{ref.referredName}</div>
                                        <div className="text-sm text-slate-500">{ref.referredEmail}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{ref.referrerName}</div>
                                        <div className="text-sm text-slate-500">{ref.referrerEmail}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{new Date(ref.timestamp).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {ref.converted ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                {React.cloneElement(Icons.check, {className: "h-3 w-3"})}
                                                Converted
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                                Not Converted
                                            </span>
                                        )}
                                        {ref.convertedAt && <div className="text-xs text-slate-400 mt-1">On: {new Date(ref.convertedAt).toLocaleDateString()}</div>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center text-slate-500 py-8">No matching referrals found.</td>
                                </tr>
                            )}
                         </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
};