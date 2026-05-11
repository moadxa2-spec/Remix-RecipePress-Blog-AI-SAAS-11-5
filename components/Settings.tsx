

import React from 'react';
import { SiteManager } from './SiteManager';
import { GeminiApiKeySettings } from './GeminiApiKeySettings';
import { ArticleAgentSettings } from './ArticleAgentSettings';
import { PinterestSettingsComponent } from './PinterestSettings';
import { LogViewer } from './LogViewer';
import { ReferralSettings } from './ReferralSettings';
import { ApiSettings } from './ApiSettings';
import { ApiLogViewer } from './ApiLogViewer';
import { Icons } from '../constants';
import type { User, WordPressSite, ToastType, ToastMessage, SettingsTab, ArticleAgentSettings as ArticleAgentSettingsType, PinterestSettings as PinterestSettingsType } from '../types';
import { SecuritySettings } from './SecuritySettings';

interface SettingsProps {
    sites: WordPressSite[];
    addSite: (site: Omit<WordPressSite, 'id'>) => void;
    removeSite: (id: string) => void;
    updateSite: (site: WordPressSite) => void;
    showToast: (config: string | ToastMessage, type?: ToastType) => void;
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    articleAgentSettings: ArticleAgentSettingsType;
    setArticleAgentSettings: (settings: ArticleAgentSettingsType) => void;
    pinterestSettings: PinterestSettingsType;
    setPinterestSettings: (settings: PinterestSettingsType) => void;
    activeTab: SettingsTab;
    setActiveTab: (tab: SettingsTab) => void;
    currentUser: User;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    isQueuePaused: boolean;
}

const TabButton: React.FC<{
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
            isActive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
        }`}
        role="tab"
        aria-selected={isActive}
    >
        {React.cloneElement(icon, { className: "h-5 w-5" })}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

export const Settings: React.FC<SettingsProps> = (props) => {
    const { activeTab, setActiveTab, showToast, currentUser } = props;

    const renderContent = () => {
        switch (activeTab) {
            case 'sites':
                return <SiteManager {...props} />;
            case 'gemini':
                return <GeminiApiKeySettings geminiApiKey={props.geminiApiKey} setGeminiApiKey={props.setGeminiApiKey} showToast={showToast} isQueuePaused={props.isQueuePaused} />;
            case 'articleAgent':
                return <ArticleAgentSettings settings={props.articleAgentSettings} setSettings={props.setArticleAgentSettings} showToast={showToast} />;
            case 'pinterest':
                return <PinterestSettingsComponent settings={props.pinterestSettings} setSettings={props.setPinterestSettings} showToast={showToast} />;
            case 'security':
                return <SecuritySettings currentUser={currentUser} onUpdateUser={props.onUpdateUser} showToast={showToast} />;
            case 'referrals':
                return <ReferralSettings currentUser={currentUser} showToast={showToast} />;
            case 'logs':
                return <LogViewer showToast={showToast} />;
            case 'api':
                return currentUser.apiToken ? (
                    <div className="space-y-8">
                        <ApiSettings apiToken={currentUser.apiToken} showToast={showToast} />
                        <ApiLogViewer apiToken={currentUser.apiToken} showToast={showToast} />
                    </div>
                ) : <p>API settings are only available for the admin account.</p>;
            default:
                return <SiteManager {...props} />;
        }
    };

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'owner';

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80">
            <div className="border-b border-slate-200">
                <nav className="flex flex-wrap gap-2 sm:gap-4 px-4 sm:px-6 -mb-px" aria-label="Tabs" role="tablist">
                    <TabButton
                        label="Manage Sites"
                        icon={Icons.server}
                        isActive={activeTab === 'sites'}
                        onClick={() => setActiveTab('sites')}
                    />
                    <TabButton
                        label="Gemini API"
                        icon={Icons.key}
                        isActive={activeTab === 'gemini'}
                        onClick={() => setActiveTab('gemini')}
                    />
                     <TabButton
                        label="Article Agent"
                        icon={Icons.academicCap}
                        isActive={activeTab === 'articleAgent'}
                        onClick={() => setActiveTab('articleAgent')}
                    />
                    <TabButton
                        label="Pinterest"
                        icon={Icons.photo}
                        isActive={activeTab === 'pinterest'}
                        onClick={() => setActiveTab('pinterest')}
                    />
                     <TabButton
                        label="Security"
                        icon={React.cloneElement(Icons.shieldCheck, { className: "h-6 w-6"})}
                        isActive={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                    />
                    <TabButton
                        label="Referrals"
                        icon={Icons.users}
                        isActive={activeTab === 'referrals'}
                        onClick={() => setActiveTab('referrals')}
                    />
                    <TabButton
                        label="App Logs"
                        icon={Icons.code}
                        isActive={activeTab === 'logs'}
                        onClick={() => setActiveTab('logs')}
                    />
                    {isAdmin && (
                        <TabButton
                            label="API & Logs"
                            icon={Icons.shieldCheck}
                            isActive={activeTab === 'api'}
                            onClick={() => setActiveTab('api')}
                        />
                    )}
                </nav>
            </div>
             <div className="p-4 sm:p-6">
                {renderContent()}
            </div>
        </div>
    );
};
