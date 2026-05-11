
import React, { useState } from 'react';
import type { AdminSettings, NotificationTemplate, AffiliateSettings, LanguageSetting, ToastType, AffiliateVisual } from '../../types';
import { Icons } from '../../constants';

interface CustomizationManagerProps {
    adminSettings: AdminSettings;
    onSave: (updates: Partial<AdminSettings>) => void;
    showToast: (message: string, type?: ToastType) => void;
}

type CustomizationTab = 'notifications' | 'affiliates' | 'languages';

const TabButton: React.FC<{ label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}>
        {icon}
        {label}
    </button>
);

const NotificationTemplateEditor: React.FC<{
    templates: NotificationTemplate[];
    onSave: (templates: NotificationTemplate[]) => void;
}> = ({ templates, onSave }) => {
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

    const handleSave = () => {
        if (!editingTemplate) return;
        const newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
        onSave(newTemplates);
        setEditingTemplate(null);
    };

    return (
        <div className="space-y-4">
            {templates.map(template => (
                <div key={template.id} className="p-4 border rounded-lg bg-white">
                    <button onClick={() => setEditingTemplate(template)} className="w-full flex justify-between items-center text-left">
                        <div>
                            <h4 className="font-semibold text-slate-800">{template.name}</h4>
                            <p className="text-sm text-slate-500">{template.subject}</p>
                        </div>
                        <span className="text-teal-600 text-sm font-semibold">Edit</span>
                    </button>
                </div>
            ))}

            {editingTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setEditingTemplate(null)}>
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Edit: {editingTemplate.name}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Subject</label>
                                <input type="text" value={editingTemplate.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})} className="w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Body</label>
                                <textarea value={editingTemplate.body} onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})} rows={8} className="w-full p-2 border rounded-md font-mono text-sm" />
                            </div>
                            <div className="text-xs text-slate-500">
                                Available placeholders: {editingTemplate.placeholders.map(p => <code key={p} className="bg-slate-100 p-1 rounded">{p}</code>).reduce((prev, curr) => <>{prev}, {curr}</>)}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                             <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                             <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-teal-600 text-white">Save Template</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AffiliateContentManager: React.FC<{
    settings: AffiliateSettings;
    onSave: (settings: AffiliateSettings) => void;
}> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700">Affiliate Text Snippets</label>
                <textarea 
                    value={localSettings.textSnippets}
                    onChange={e => setLocalSettings({...localSettings, textSnippets: e.target.value})}
                    rows={6}
                    className="w-full mt-1 p-2 border rounded-md font-mono text-sm"
                    placeholder="One affiliate link or snippet per line."
                />
                <p className="text-xs text-slate-500 mt-1">These links will be available for the Article Agent to use as external links.</p>
            </div>
            <div>
                <h4 className="text-base font-semibold text-slate-800">Visual Assets (Coming Soon)</h4>
                <div className="p-8 mt-2 border-2 border-dashed rounded-lg text-center text-slate-500">
                    <p>Soon, you'll be able to upload banner images and other visuals for the AI to include in generated content.</p>
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={() => onSave(localSettings)} className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold">Save Affiliate Settings</button>
            </div>
        </div>
    );
};

const LanguageManager: React.FC<{
    settings: LanguageSetting[];
    onSave: (settings: LanguageSetting[]) => void;
}> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangName, setNewLangName] = useState('');

    const handleToggle = (id: string) => {
        setLocalSettings(localSettings.map(lang => lang.id === id ? {...lang, isEnabled: !lang.isEnabled} : lang));
    };

    const handleSetDefault = (id: string) => {
        setLocalSettings(localSettings.map(lang => ({...lang, isDefault: lang.id === id})));
    };
    
    const handleAddLanguage = () => {
      if (!newLangCode.trim() || !newLangName.trim()) return;
      const newLang: LanguageSetting = {
        id: newLangCode,
        code: newLangCode,
        name: newLangName,
        isEnabled: true,
        isDefault: false,
      };
      setLocalSettings([...localSettings, newLang]);
      setNewLangCode('');
      setNewLangName('');
    };

    return (
        <div className="space-y-4">
             {localSettings.map(lang => (
                <div key={lang.id} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                    <div>
                        <p className="font-medium text-slate-800">{lang.name} <code className="text-xs bg-slate-100 p-1 rounded">{lang.code}</code></p>
                    </div>
                    <div className="flex items-center gap-4">
                        {lang.isDefault ? <span className="text-xs font-bold text-teal-700">DEFAULT</span> : (
                           <button onClick={() => handleSetDefault(lang.id)} className="text-xs font-medium text-slate-500 hover:text-slate-800">Set as default</button>
                        )}
                        <button onClick={() => handleToggle(lang.id)} className={`px-3 py-1 text-xs rounded-full ${lang.isEnabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{lang.isEnabled ? 'Enabled' : 'Disabled'}</button>
                    </div>
                </div>
             ))}
             <div className="p-4 border-t pt-4 space-y-2">
                 <h4 className="font-semibold">Add New Language</h4>
                 <div className="flex gap-2">
                     <input value={newLangCode} onChange={e => setNewLangCode(e.target.value)} placeholder="Language Code (e.g., fr-FR)" className="flex-1 p-2 border rounded-md text-sm" />
                     <input value={newLangName} onChange={e => setNewLangName(e.target.value)} placeholder="Language Name (e.g., Français)" className="flex-1 p-2 border rounded-md text-sm" />
                     <button onClick={handleAddLanguage} className="px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-semibold">Add</button>
                 </div>
             </div>
             <div className="flex justify-end pt-4">
                 <button onClick={() => onSave(localSettings)} className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold">Save Language Settings</button>
             </div>
        </div>
    );
};

export const CustomizationManager: React.FC<CustomizationManagerProps> = ({ adminSettings, onSave, showToast }) => {
    const [activeTab, setActiveTab] = useState<CustomizationTab>('notifications');

    const renderContent = () => {
        switch (activeTab) {
            case 'notifications':
                return <NotificationTemplateEditor templates={adminSettings.notificationTemplates} onSave={(templates) => onSave({ notificationTemplates: templates })} />;
            case 'affiliates':
                return <AffiliateContentManager settings={adminSettings.affiliateSettings} onSave={(settings) => onSave({ affiliateSettings: settings })} />;
            case 'languages':
                return <LanguageManager settings={adminSettings.languageSettings} onSave={(settings) => onSave({ languageSettings: settings })} />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800">Customization</h2>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                    <TabButton label="Notifications" icon={Icons.inbox} isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    <TabButton label="Affiliates" icon={Icons.currencyDollar} isActive={activeTab === 'affiliates'} onClick={() => setActiveTab('affiliates')} />
                    <TabButton label="Languages" icon={Icons.globe} isActive={activeTab === 'languages'} onClick={() => setActiveTab('languages')} />
                </div>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};
