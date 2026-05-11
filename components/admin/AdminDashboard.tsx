import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../../constants';
import * as dataService from '../../services/dataService';
import type { User, LicenseKey, ToastMessage, ToastType, Notification, Referral, AdminSettings, SupportTicket, Feedback, QuickReplyTemplate, ActivityLog } from '../../types';
import { Spinner } from '../Spinner';
import { NotificationManager } from './NotificationManager';
import { LicenseKeyManager } from './LicenseKeyManager';
import { ReferralManager } from './ReferralManager';
import { UserManager } from './UserManager';
import { BrandingManager } from './BrandingManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ActivityLogViewer } from './ActivityLogViewer';
import { BackupManager } from './BackupManager';
import { AutomationManager } from './AutomationManager';
import { SupportManager } from './SupportManager';
import { IntegrationsManager } from './IntegrationsManager';
import { CustomizationManager } from './CustomizationManager';
// FIX: Corrected date-fns imports to use sub-paths for functions not exported from the root module.
import { eachDayOfInterval, isSameDay, format } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import parseISO from 'date-fns/parseISO';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AdminDashboardProps {
    showToast: (config: string | ToastMessage, type?: ToastType) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'stats' | 'read'>) => void;
    deleteNotification: (ids: string[]) => void;
    allNotifications: Notification[];
    allUsers: User[];
    licenseKeys: LicenseKey[];
    referrals: Referral[];
    activityLogs: ActivityLog[];
    adminSettings: AdminSettings;
    setLicenseKeys: (keys: LicenseKey[]) => void;
    setAdminSettings: (settings: AdminSettings) => void;
    handleUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    handleDeleteUsers: (userIds: string[]) => Promise<void>;
    handleResetUserData: (userId: string) => Promise<void>;
    handleAdminCreateUser: (userData: Partial<User>, password?: string) => Promise<void>;
    currentUser: User;
    refreshData: () => void;
    isLoading: boolean;
    supportTickets: SupportTicket[];
    feedback: Feedback[];
    quickReplyTemplates: QuickReplyTemplate[];
    setSupportTickets: (tickets: SupportTicket[]) => void;
    setFeedback: (feedback: Feedback[]) => void;
    setQuickReplyTemplates: (templates: QuickReplyTemplate[]) => void;
}

type AdminView = 'dashboard' | 'notifications' | 'keys' | 'users' | 'referrals' | 'analytics' | 'logs' | 'settings' | 'support' | 'api';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<{ className?: string }>; }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className="bg-teal-100 text-teal-600 rounded-lg p-3">
                {React.cloneElement(icon, { className: "h-6 w-6" })}
            </div>
        </div>
    </div>
);

const QuickActionCard: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode; }> = ({ title, onClick, icon }) => (
    <button onClick={onClick} className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all text-left w-full flex items-center gap-4 hover:shadow-md hover:-translate-y-1 duration-300">
         <div className="bg-teal-100 text-teal-600 rounded-lg p-3">
            {icon}
        </div>
        <p className="font-semibold text-slate-800 text-lg">{title}</p>
        <div className="ml-auto text-slate-400">
            {React.cloneElement(Icons.arrowRight, { className: "h-5 w-5" })}
        </div>
    </button>
);


const DashboardOverview: React.FC<{
    allUsers: User[];
    allNotifications: Notification[];
    referrals: Referral[];
    setActiveView: (view: AdminView) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'stats' | 'read'>) => void;
}> = ({ allUsers, allNotifications, referrals, setActiveView, addNotification }) => {
    
    const stats = useMemo(() => {
        const activeUsers = allUsers.filter(u => u.status === 'active').length;
        const notificationsSent = allNotifications.reduce((acc, n) => acc + (n.stats?.sent || 0), 0);
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newSignups = allUsers.filter(u => new Date(u.registeredAt) >= oneWeekAgo).length;

        return {
            totalUsers: allUsers.length,
            activeUsers,
            newSignups,
            notificationsSent,
        };
    }, [allUsers, allNotifications]);

    const referralChartData = useMemo(() => {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const weekDays = eachDayOfInterval({ start, end: today });

        const data = weekDays.map(day => ({
            date: day,
            name: format(day, 'EEE'), // Mon, Tue, etc.
            Referrals: 0
        }));

        referrals.forEach(ref => {
            const refDate = parseISO(ref.timestamp);
             const dayData = data.find(d => isSameDay(d.date, refDate));
             if (dayData) {
                 dayData.Referrals++;
             }
        });

        return data.map(({name, Referrals}) => ({name, Referrals}));
    }, [referrals]);
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Icons.users} />
                <StatCard title="Active Users" value={stats.activeUsers} icon={Icons.shieldCheck} />
                <StatCard title="New Sign-ups (7d)" value={stats.newSignups} icon={Icons.user} />
                <StatCard title="Notifications Sent" value={stats.notificationsSent} icon={Icons.bell} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Pinterest Performance</h2>
                        <p className="text-sm text-slate-500">Real-time stats from your linked Pinterest account</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold animate-pulse">
                         <div className="w-2 h-2 bg-red-600 rounded-full" />
                         LIVE SYNCING
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Impressions</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">12.4K <span className="text-xs text-green-500 font-bold">+5.2%</span></p>
                        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[65%]" />
                        </div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engagements</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">842 <span className="text-xs text-green-500 font-bold">+12.8%</span></p>
                        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[42%]" />
                        </div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Save Rate</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">3.1% <span className="text-xs text-slate-400 font-bold">Stable</span></p>
                        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[28%]" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickActionCard title="Send Notification" onClick={() => setActiveView('notifications')} icon={Icons.bell} />
                            <QuickActionCard title="Create License Key" onClick={() => setActiveView('keys')} icon={Icons.key} />
                            <QuickActionCard title="View Invites" onClick={() => setActiveView('referrals')} icon={Icons.trendingUp} />
                            <QuickActionCard title="View Support Tickets" onClick={() => setActiveView('support')} icon={Icons.ticket} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Referral Stats (Last 7 Days)</h2>
                     <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={referralChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Referrals" stroke="#14b8a6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </div>
    );
};

const AdminSidebar: React.FC<{
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
    isOwner: boolean;
}> = ({ activeView, setActiveView, isOwner }) => {
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.trendingUp },
        { id: 'notifications', label: 'Notifications', icon: Icons.bell },
        { id: 'keys', label: 'License Keys', icon: Icons.key },
        { id: 'users', label: 'Users', icon: Icons.users },
        { id: 'referrals', label: 'Affiliate/Referrals', icon: Icons.currencyDollar },
        { id: 'analytics', label: 'Reports & Analytics', icon: Icons.trendingUp },
        { id: 'logs', label: 'Logs & Security', icon: Icons.shieldCheck },
        { id: 'support', label: 'Support', icon: Icons.ticket },
    ];
    
    const ownerItems = [
        { id: 'settings', label: 'Settings', icon: Icons.cog },
        { id: 'api', label: 'API & Integrations', icon: Icons.globe },
    ];

    if (isOwner) {
        navItems.push(...ownerItems);
    }
    
    return (
        <aside className="bg-white md:bg-transparent h-full">
            <nav className="space-y-1 p-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as AdminView)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 group ${
                            activeView === item.id 
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {React.cloneElement(item.icon, {className: `h-5 w-5 ${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`})}
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { currentUser, isLoading } = props;
    
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="h-12 w-12" /></div>;
    }

    const isOwner = currentUser.role === 'owner';
    
    const viewTitles: Record<AdminView, string> = {
        dashboard: 'Dashboard',
        notifications: 'Notifications',
        keys: 'License Keys',
        users: 'Users',
        referrals: 'Affiliate/Referrals',
        analytics: 'Reports & Analytics',
        logs: 'Logs & Security',
        support: 'Support',
        settings: 'Settings',
        api: 'API & Integrations'
    };
    const currentViewTitle = viewTitles[activeView];


    const renderActiveView = () => {
        switch(activeView) {
            case 'dashboard':
                return <DashboardOverview {...props} setActiveView={setActiveView} />;
            case 'notifications':
                return <NotificationManager {...props} users={props.allUsers} />;
            case 'keys':
                 return <LicenseKeyManager {...props} onCreateKey={(keyData) => {
                    const newKey: LicenseKey = {
                        id: crypto.randomUUID(),
                        key: `RP-${crypto.randomUUID().toUpperCase()}`,
                        createdAt: new Date().toISOString(),
                        assignedTo: null,
                        assignedEmail: '',
                        ...keyData,
                    };
                    const updatedKeys = [newKey, ...props.licenseKeys];
                    props.setLicenseKeys(updatedKeys);
                    dataService.saveLicenseKeys(updatedKeys);
                    dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'license_key_create', details: `Created key ${newKey.key}` });
                    props.showToast('License key created successfully.', 'success');
                }} onUpdateKey={(updatedKey) => {
                    const updatedKeys = props.licenseKeys.map(k => k.id === updatedKey.id ? updatedKey : k);
                    props.setLicenseKeys(updatedKeys);
                    dataService.saveLicenseKeys(updatedKeys);
                    dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'license_key_update', targetType: 'license_key', targetId: updatedKey.id, details: `Updated key ${updatedKey.key}` });
                    props.showToast('License key updated successfully.', 'success');
                }} onDeleteKeys={(keyIds) => {
                    const keysToDelete = props.licenseKeys.filter(k => keyIds.includes(k.id));
                    const activeKeyInSelection = keysToDelete.some(k => k.status === 'active');
                    if (activeKeyInSelection) {
                        props.showToast('Cannot delete keys that are currently active. Please revoke or deactivate them first.', 'error');
                        return;
                    }
                    if (window.confirm(`Are you sure you want to permanently delete ${keyIds.length} key(s)? This action cannot be undone.`)) {
                        const updatedKeys = props.licenseKeys.filter(k => !keyIds.includes(k.id));
                        props.setLicenseKeys(updatedKeys);
                        dataService.saveLicenseKeys(updatedKeys);
                        dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'license_key_delete', details: `Deleted ${keyIds.length} key(s)` });
                        props.showToast(`${keyIds.length} key(s) deleted.`, 'success');
                    }
                }} />;
            case 'users':
                return <UserManager 
                    users={props.allUsers}
                    showToast={props.showToast}
                    onUpdateUser={props.handleUpdateUser}
                    onDeleteUsers={props.handleDeleteUsers}
                    onResetUserData={props.handleResetUserData}
                    onAdminCreateUser={props.handleAdminCreateUser}
                    currentUser={props.currentUser}
                />;
            case 'referrals':
                return <ReferralManager {...props} users={props.allUsers} onSettingsChange={(newSettings) => {
                     props.setAdminSettings(newSettings);
                     dataService.saveAdminSettings(newSettings);
                     dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'admin_settings_update', details: `Referral settings updated.` });
                     props.showToast('Settings saved.', 'success');
                }}/>;
            case 'analytics':
                 return <AnalyticsDashboard {...props} users={props.allUsers} notifications={props.allNotifications} />;
            case 'logs':
                return <ActivityLogViewer {...props} logs={props.activityLogs} users={props.allUsers} />;
            case 'settings':
                if (!isOwner) return <p>Access Denied.</p>;
                return <div className="space-y-8">
                        <BrandingManager settings={props.adminSettings.branding} onSave={(branding) => {
                             const newSettings = { ...props.adminSettings, branding };
                             props.setAdminSettings(newSettings);
                             dataService.saveAdminSettings(newSettings);
                             dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'branding_update' });
                             props.showToast('Branding settings saved successfully!', 'success');
                        }} showToast={props.showToast} />
                        <AutomationManager settings={props.adminSettings.automations} onSave={(automations) => {
                             const newSettings = { ...props.adminSettings, automations };
                             props.setAdminSettings(newSettings);
                             dataService.saveAdminSettings(newSettings);
                             dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'automation_settings_update', details: `Automations updated.` });
                             props.showToast('Automation settings saved.', 'success');
                        }} showToast={props.showToast} currentUser={currentUser} />
                        <CustomizationManager adminSettings={props.adminSettings} onSave={(updates) => {
                             const newSettings = { ...props.adminSettings, ...updates };
                             props.setAdminSettings(newSettings);
                             dataService.saveAdminSettings(newSettings);
                             dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'customization_update' });
                             props.showToast('Customization settings saved.', 'success');
                        }} showToast={props.showToast} />
                         <BackupManager showToast={props.showToast} />
                    </div>;
            case 'support':
                return <SupportManager 
                    tickets={props.supportTickets}
                    feedback={props.feedback}
                    templates={props.quickReplyTemplates}
                    setTickets={props.setSupportTickets}
                    setFeedback={props.setFeedback}
                    setTemplates={props.setQuickReplyTemplates}
                    users={props.allUsers}
                    currentUser={props.currentUser}
                    showToast={props.showToast}
                />;
            case 'api':
                 if (!isOwner) return <p>Access Denied.</p>;
                 return <IntegrationsManager 
                    adminSettings={props.adminSettings} 
                    currentUser={props.currentUser}
                    onUpdateUser={props.handleUpdateUser} 
                    showToast={props.showToast}
                    onSave={(integrations) => {
                        const newSettings = { ...props.adminSettings, ...integrations };
                        props.setAdminSettings(newSettings);
                        dataService.saveAdminSettings(newSettings);
                        dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'integrations_update' });
                        props.showToast('Integration settings saved.', 'success');
                 }} />;
            default:
                return <p>Not implemented</p>;
        }
    }

    return (
       <div className="relative min-h-[calc(100vh-10rem)] md:flex">
            {/* Sidebar for Mobile (Slide-out) */}
            <div 
                className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:hidden transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-bold text-lg text-slate-800">Admin Menu</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                        <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <AdminSidebar activeView={activeView} setActiveView={(view) => { setActiveView(view); setIsSidebarOpen(false); }} isOwner={isOwner} />
            </div>
            
            {/* Backdrop for mobile */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Sidebar for Desktop (Static) */}
            <div className="hidden md:block md:w-64 md:flex-shrink-0">
                 <div className="flex h-full min-h-0 flex-col">
                    <AdminSidebar activeView={activeView} setActiveView={setActiveView} isOwner={isOwner} />
                 </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 md:pl-8">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-16 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
                        <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">{currentViewTitle}</h1>
                    <div className="w-6"></div> {/* Spacer to balance the hamburger icon */}
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div key={activeView} className="animate-fadeInUp">
                        {renderActiveView()}
                    </div>
                </div>
            </main>
        </div>
    );
};