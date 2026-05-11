import React, { useState, useEffect } from 'react';
import type { WordPressSite, ToastType, ToastMessage } from '../types';
import { Icons } from '../constants';
import { verifyConnection } from '../services/wordpressService';
import { Spinner } from './Spinner';

interface SiteManagerProps {
  sites: WordPressSite[];
  addSite: (site: Omit<WordPressSite, 'id'>) => void;
  removeSite: (id: string) => void;
  updateSite: (site: WordPressSite) => void;
  showToast: (config: string | ToastMessage, type?: ToastType) => void;
}

const EditSiteModal: React.FC<{
    site: WordPressSite;
    onSave: (site: WordPressSite) => void;
    onClose: () => void;
}> = ({ site, onSave, onClose }) => {
    const [name, setName] = useState(site.name);
    const [url, setUrl] = useState(site.url);
    const [siteToken, setSiteToken] = useState(site.siteToken);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url || !siteToken) {
            setError('All fields are required.');
            return;
        }
        try { new URL(url); } catch (_) {
            setError('Please enter a valid URL.');
            return;
        }
        onSave({ ...site, name, url, siteToken });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeInUp">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Site</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-site-name" className="block text-sm font-medium text-slate-700">Site Name</label>
                        <input type="text" id="edit-site-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="edit-site-url" className="block text-sm font-medium text-slate-700">WordPress URL</label>
                        <input type="url" id="edit-site-url" value={url} onChange={e => setUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="edit-site-token" className="block text-sm font-medium text-slate-700">Site Token</label>
                        <input type="password" id="edit-site-token" value={siteToken} onChange={e => setSiteToken(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SiteItem: React.FC<{
    site: WordPressSite;
    onEdit: (e: React.MouseEvent) => void;
    onRemove: (e: React.MouseEvent) => void;
    onTestConnection: (e: React.MouseEvent) => void;
    isTesting: boolean;
}> = ({ site, onEdit, onRemove, onTestConnection, isTesting }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200/80 last:border-b-0 gap-3 hover:bg-slate-50 transition-colors">
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-slate-800 truncate" title={site.name}>{site.name}</p>
            <p className="text-sm text-slate-500 truncate" title={site.url}>{site.url}</p>
        </div>
        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
            <button type="button" onClick={onTestConnection} disabled={isTesting} className="p-2 text-slate-500 hover:text-teal-600 disabled:opacity-50 disabled:cursor-wait rounded-full hover:bg-slate-200 transition-colors" title="Test Connection">
                {isTesting ? <Spinner size="h-5 w-5" /> : <div className="pointer-events-none">{Icons.shieldCheck}</div>}
            </button>
            <button type="button" onClick={onEdit} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors" title="Edit Site"><div className="pointer-events-none">{Icons.pencil}</div></button>
            <button type="button" onClick={onRemove} className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" title="Remove Site"><div className="pointer-events-none">{Icons.trash}</div></button>
        </div>
    </div>
);


export const SiteManager: React.FC<SiteManagerProps> = ({ sites, addSite, removeSite, updateSite, showToast }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSite, setEditingSite] = useState<WordPressSite | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteToken, setNewSiteToken] = useState('');
  const [isTesting, setIsTesting] = useState<Set<string>>(new Set());

  const handleAddSite = () => {
    if (!newSiteName || !newSiteUrl || !newSiteToken) {
        showToast('All fields are required.', 'error');
        return;
    }
     try { new URL(newSiteUrl); } catch (_) {
        showToast('Please enter a valid URL.', 'error');
        return;
    }
    addSite({ name: newSiteName, url: newSiteUrl, siteToken: newSiteToken });
    setNewSiteName('');
    setNewSiteUrl('');
    setNewSiteToken('');
    setIsAdding(false);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to remove this site?')) {
        removeSite(id);
    }
  };
  
  const testConnection = async (site: WordPressSite, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsTesting(prev => new Set(prev).add(site.id));
      const result = await verifyConnection(site);
      if (result.success) {
          showToast({ message: `Successfully connected to ${site.name}!`, type: 'success' });
      } else {
          showToast({ message: `Connection to ${site.name} failed: ${result.message}`, type: 'error', persistent: true });
      }
      setIsTesting(prev => {
          const newSet = new Set(prev);
          newSet.delete(site.id);
          return newSet;
      });
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Manage Sites</h2>
                <p className="text-slate-500 mt-1">Connect and configure your WordPress websites.</p>
            </div>
            <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors shadow-sm self-start sm:self-center">
                {Icons.add}
                <span>Add New Site</span>
            </button>
        </div>
        
        {isAdding && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 space-y-3 animate-fadeInUp">
                <h3 className="text-lg font-semibold text-slate-800">Add a New Site Connection</h3>
                <input type="text" value={newSiteName} onChange={e => setNewSiteName(e.target.value)} placeholder="Site Name (e.g., My Food Blog)" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                <input type="url" value={newSiteUrl} onChange={e => setNewSiteUrl(e.target.value)} placeholder="WordPress URL (e.g., https://example.com)" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                <input type="password" value={newSiteToken} onChange={e => setNewSiteToken(e.target.value)} placeholder="Site Token from WordPress Plugin" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" />
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleAddSite} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">Save Site</button>
                </div>
            </div>
        )}

        <div className="border border-slate-200/80 rounded-lg bg-white overflow-hidden">
            {sites.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <div className="inline-block p-4 bg-slate-100 rounded-full">{React.cloneElement(Icons.server, {className: "h-8 w-8 text-slate-400"})}</div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-800">No sites connected</h3>
                    <p className="mt-1">Click "Add New Site" to get started.</p>
                </div>
            ) : (
                sites.map(site => (
                    <SiteItem
                        key={site.id}
                        site={site}
                        onEdit={(e) => { e.stopPropagation(); setEditingSite(site); }}
                        onRemove={(e) => handleRemove(site.id, e)}
                        onTestConnection={(e) => testConnection(site, e)}
                        isTesting={isTesting.has(site.id)}
                    />
                ))
            )}
        </div>
      {editingSite && <EditSiteModal site={editingSite} onSave={updateSite} onClose={() => setEditingSite(null)} />}
    </div>
  );
};