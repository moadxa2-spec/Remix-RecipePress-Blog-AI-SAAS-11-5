import React, { useState, useEffect } from 'react';
import type { AdminSettings, EmailSettings, PaymentSettings, ToastType, User } from '../../types';
import { Icons } from '../../constants';
import * as authService from '../../services/authService';
import { Spinner } from '../Spinner';

interface IntegrationsManagerProps {
    adminSettings: AdminSettings;
    onSave: (settings: { email: EmailSettings; payment: PaymentSettings }) => void;
    currentUser: User;
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    showToast: (message: string, type?: ToastType) => void;
}

const CodeBlock: React.FC<{ code: string; onCopy: () => void; }> = ({ code, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800 text-slate-100 rounded-md p-3 my-2 relative">
            <pre className="whitespace-pre-wrap text-sm"><code>{code.trim()}</code></pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition text-white">
                {copied ? Icons.check : Icons.copy}
            </button>
        </div>
    );
};

export const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ adminSettings, onSave, currentUser, onUpdateUser, showToast }) => {
    const [emailSettings, setEmailSettings] = useState<EmailSettings>(adminSettings.email);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(adminSettings.payment);
    const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        // This ensures window is available, preventing build errors in SSR environments
        setApiUrl(`${window.location.origin}/functions/api/generate`);
    }, []);
    
    const handleSave = () => {
        onSave({ email: emailSettings, payment: paymentSettings });
    };

    const handleTestEmail = () => {
        // This is a mock test
        showToast(`Simulating test email to 'test@example.com' via ${emailSettings.provider}.`, 'success');
    };
    
    const handleRegenerateToken = async () => {
        if (window.confirm('Are you sure you want to regenerate the API token? The old token will stop working immediately.')) {
            setIsRegeneratingToken(true);
            try {
                const updatedOwner = await authService.regenerateApiToken(currentUser.id);
                // This call updates the user state in App.tsx, which will flow back down here
                onUpdateUser(currentUser.id, { apiToken: updatedOwner.apiToken }); 
                showToast('API Token regenerated successfully!', 'success');
            } catch (error) {
                showToast(error instanceof Error ? error.message : 'Failed to regenerate token.', 'error');
            } finally {
                setIsRegeneratingToken(false);
            }
        }
    };
    
    const apiExample = `fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${currentUser.apiToken}'
  },
  body: JSON.stringify({
    title: "Original Post Title",
    content: "Original post content..." 
  })
});`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Integrations & API</h2>
                <p className="text-sm text-slate-500 mt-1">Connect to third-party services and manage API access.</p>
            </div>

            {/* Email Services */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-800">Email Services</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Configure a transactional email provider to send system notifications (e.g., inactivity reminders).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email-provider" className="block text-sm font-medium text-slate-700">Provider</label>
                        <select id="email-provider" value={emailSettings.provider} onChange={(e) => setEmailSettings({...emailSettings, provider: e.target.value as any})} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 rounded-md">
                            <option value="mock">Mock Service (for testing)</option>
                            <option value="sendgrid">SendGrid</option>
                            <option value="mailgun">Mailgun</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="from-email" className="block text-sm font-medium text-slate-700">"From" Email Address</label>
                        <input type="email" id="from-email" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="email-api-key" className="block text-sm font-medium text-slate-700">API Key</label>
                        <input type="password" id="email-api-key" value={emailSettings.apiKey} onChange={(e) => setEmailSettings({...emailSettings, apiKey: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end items-center gap-3 mt-4">
                    <button onClick={handleTestEmail} type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Test</button>
                    <button onClick={handleSave} type="button" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Save Email Settings</button>
                </div>
            </div>
            
            {/* Payment Gateways */}
            <div className="border-t pt-6">
                 <h3 className="text-lg font-semibold text-slate-800">Payment Gateways</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Connect a payment provider to manage Pro plan subscriptions.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="payment-provider" className="block text-sm font-medium text-slate-700">Provider</label>
                        <select id="payment-provider" value={paymentSettings.provider} onChange={(e) => setPaymentSettings({...paymentSettings, provider: e.target.value as any})} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 rounded-md">
                            <option value="mock">Mock Gateway (for testing)</option>
                            <option value="stripe">Stripe</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="public-key" className="block text-sm font-medium text-slate-700">Public Key</label>
                        <input type="text" id="public-key" value={paymentSettings.publicKey} onChange={(e) => setPaymentSettings({...paymentSettings, publicKey: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="secret-key" className="block text-sm font-medium text-slate-700">Secret Key</label>
                        <input type="password" id="secret-key" value={paymentSettings.secretKey} onChange={(e) => setPaymentSettings({...paymentSettings, secretKey: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end mt-4">
                    <button onClick={handleSave} type="button" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Save Payment Settings</button>
                </div>
            </div>

            {/* Public API */}
            <div className="border-t pt-6">
                 <h3 className="text-lg font-semibold text-slate-800">Public API Access</h3>
                 <p className="text-sm text-slate-500 mt-1 mb-4">Use the API to integrate with external applications. Requires a deployed backend.</p>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">API Token</label>
                         <div className="flex items-center gap-2 mt-1">
                             <input type="password" readOnly value={currentUser.apiToken} className="flex-grow px-3 py-2 bg-slate-100 border border-slate-300 rounded-md font-mono text-sm" />
                             <button onClick={handleRegenerateToken} disabled={isRegeneratingToken} className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:bg-slate-100">
                                {isRegeneratingToken ? <Spinner size="h-5 w-5" /> : 'Regenerate'}
                            </button>
                         </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">API Endpoint URL</label>
                        <CodeBlock code={apiUrl} onCopy={() => showToast('API URL copied!', 'success')} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Example Usage (cURL)</label>
                        <CodeBlock code={apiExample} onCopy={() => showToast('Example code copied!', 'success')} />
                     </div>
                 </div>
            </div>
        </div>
    );
};