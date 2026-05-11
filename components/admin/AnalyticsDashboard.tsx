
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
// FIX: Corrected date-fns imports to use sub-paths for functions not exported from the root module.
import { format } from 'date-fns';
import subDays from 'date-fns/subDays';
import startOfDay from 'date-fns/startOfDay';
import type { User, LicenseKey, Notification, Referral, ToastType } from '../../types';
import * as exportUtils from '../../utils/export';

interface AnalyticsDashboardProps {
    users: User[];
    licenseKeys: LicenseKey[];
    notifications: Notification[];
    referrals: Referral[];
    showToast: (message: string, type?: ToastType) => void;
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-80 flex flex-col">
    <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
    <div className="flex-grow">{children}</div>
  </div>
);

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ users, licenseKeys, referrals, showToast }) => {

    const userSignupData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = startOfDay(subDays(new Date(), i));
            return { date, dateString: format(date, 'MMM d'), count: 0 };
        }).reverse();

        users.forEach(user => {
            const registeredDate = startOfDay(new Date(user.registeredAt));
            const dayData = last30Days.find(d => d.date.getTime() === registeredDate.getTime());
            if (dayData) {
                dayData.count++;
            }
        });

        return last30Days.map(({ dateString, count }) => ({ name: dateString, Signups: count }));
    }, [users]);

    const userPlanData = useMemo(() => {
        const proUsers = users.filter(u => u.plan === 'pro').length;
        const freeUsers = users.filter(u => u.plan === 'free').length;
        return [
            { name: 'Pro Users', value: proUsers },
            { name: 'Free Users', value: freeUsers },
        ];
    }, [users]);

    const licenseKeyData = useMemo(() => {
        const statusCounts = licenseKeys.reduce((acc, key) => {
            acc[key.status] = (acc[key.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [licenseKeys]);
    
    const topReferrers = useMemo(() => {
        const referrerCounts = referrals
            .filter(r => r.converted)
            .reduce((acc, ref) => {
                acc[ref.referrerId] = acc[ref.referrerId] || { name: ref.referrerName, count: 0 };
                acc[ref.referrerId].count++;
                return acc;
            }, {} as Record<string, {name: string, count: number}>);

        return (Object.values(referrerCounts) as { name: string; count: number }[])
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [referrals]);

    const COLORS = ['#14b8a6', '#64748b', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">Analytics & Reports</h2>
                 <p className="text-slate-500 mt-1">Key metrics and data exports for your application.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ChartContainer title="User Signups (Last 30 Days)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userSignupData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" style={{ fontSize: '12px' }}/>
                            <YAxis allowDecimals={false} style={{ fontSize: '12px' }}/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Signups" stroke="#0d9488" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                
                <ChartContainer title="User Plan Distribution">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={userPlanData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                                {userPlanData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="License Key Status">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={licenseKeyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" width={80} style={{ fontSize: '12px' }}/>
                            <Tooltip />
                            <Bar dataKey="value" fill="#0d9488" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Top Referrers</h3>
                    {topReferrers.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {topReferrers.map((referrer, index) => (
                                <li key={index} className="py-3 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">{referrer.name}</span>
                                    <span className="text-sm font-semibold text-teal-600">{referrer.count} conversions</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-sm text-slate-500 text-center py-10">No referral conversions yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Download Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button onClick={() => exportUtils.exportUsersToCSV(users, showToast)} className="w-full p-4 text-left bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <p className="font-semibold text-slate-700">Export User Data</p>
                        <p className="text-xs text-slate-500">Download a CSV of all users.</p>
                    </button>
                    <button onClick={() => exportUtils.exportLicenseKeysToCSV(licenseKeys, showToast)} className="w-full p-4 text-left bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <p className="font-semibold text-slate-700">Export License Keys</p>
                        <p className="text-xs text-slate-500">Download a CSV of all license keys.</p>
                    </button>
                    <button onClick={() => exportUtils.exportReferralsToCSV(referrals, users, showToast)} className="w-full p-4 text-left bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <p className="font-semibold text-slate-700">Export Referral Data</p>
                        <p className="text-xs text-slate-500">Download a CSV of all referrals.</p>
                    </button>
                </div>
            </div>
        </div>
    );
};
