import React, { useState, useMemo } from 'react';
import { Icons } from '../../constants';
import * as dataService from '../../services/dataService';
import type { User, SupportTicket, Feedback, QuickReplyTemplate, ToastType, TicketReply } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface SupportManagerProps {
    tickets: SupportTicket[];
    feedback: Feedback[];
    templates: QuickReplyTemplate[];
    setTickets: (tickets: SupportTicket[]) => void;
    setFeedback: (feedback: Feedback[]) => void;
    setTemplates: (templates: QuickReplyTemplate[]) => void;
    users: User[];
    currentUser: User;
    showToast: (message: string, type?: ToastType) => void;
}

type SupportTab = 'tickets' | 'feedback' | 'templates';

const TabButton: React.FC<{ label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}>
        {icon}
        {label}
    </button>
);

const TicketStatusBadge: React.FC<{ status: SupportTicket['status'] }> = ({ status }) => {
    const styles = {
        open: "bg-green-100 text-green-800",
        'in-progress': "bg-blue-100 text-blue-800",
        closed: "bg-slate-100 text-slate-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[status]}`}>{status.replace('-', ' ')}</span>;
}

const TicketPriorityBadge: React.FC<{ priority: SupportTicket['priority'] }> = ({ priority }) => {
    const styles = {
        low: "bg-slate-100 text-slate-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[priority]}`}>{priority}</span>;
}


const TicketRow: React.FC<{
    ticket: SupportTicket;
    onUpdate: (updatedTicket: SupportTicket) => void;
    staff: User[];
    currentUser: User;
    templates: QuickReplyTemplate[];
}> = ({ ticket, onUpdate, staff, currentUser, templates }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reply, setReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleStatusChange = (status: SupportTicket['status']) => onUpdate({ ...ticket, status, updatedAt: new Date().toISOString() });
    const handlePriorityChange = (priority: SupportTicket['priority']) => onUpdate({ ...ticket, priority, updatedAt: new Date().toISOString() });
    const handleAssigneeChange = (assigneeId: string | null) => onUpdate({ ...ticket, assignedTo: assigneeId, updatedAt: new Date().toISOString() });
    
    const handleReplySubmit = () => {
        if (!reply.trim()) return;
        setIsReplying(true);
        const newReply: TicketReply = {
            id: crypto.randomUUID(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            message: reply,
            createdAt: new Date().toISOString(),
        };
        const updatedTicket: SupportTicket = {
            ...ticket,
            replies: [...ticket.replies, newReply],
            status: 'in-progress',
            updatedAt: new Date().toISOString(),
        };
        onUpdate(updatedTicket);
        setReply('');
        setIsReplying(false);
    };
    
    const applyTemplate = (content: string) => {
        setReply(prev => prev ? `${prev}\n\n${content}` : content);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg">
            <div className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{ticket.subject}</p>
                        <p className="text-sm text-slate-500">{ticket.userName} &bull; {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center">
                        <TicketPriorityBadge priority={ticket.priority} />
                        <TicketStatusBadge status={ticket.status} />
                        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>{React.cloneElement(Icons.arrowDown, { className: "h-5 w-5 text-slate-400" })}</span>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4 animate-fadeInUp">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap p-3 bg-white rounded-md border">{ticket.message}</p>
                    
                    {ticket.replies.map(r => (
                        <div key={r.id} className={`p-3 rounded-lg border ${r.authorId === ticket.userId ? 'bg-white border-slate-200' : 'bg-teal-50 border-teal-200'}`}>
                            <div className="flex justify-between items-center text-xs">
                                <p className="font-bold text-slate-700">{r.authorName}</p>
                                <p className="text-slate-500">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{r.message}</p>
                        </div>
                    ))}
                    
                    <div className="border-t pt-4 space-y-3">
                        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} placeholder="Type your reply..." className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-teal-500" />
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <select onChange={(e) => { if(e.target.value) applyTemplate(e.target.value) }} value="" className="w-full sm:w-auto text-sm border-slate-300 rounded-md">
                                <option value="">Use a quick reply...</option>
                                {templates.map(t => <option key={t.id} value={t.content}>{t.title}</option>)}
                            </select>
                             <button onClick={handleReplySubmit} disabled={isReplying} className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold hover:bg-teal-700 disabled:bg-slate-400 flex items-center justify-center gap-2">
                                {Icons.reply}
                                Send Reply
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                        <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value as any)} className="text-sm border-slate-300 rounded-md">
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value as any)} className="text-sm border-slate-300 rounded-md">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <select value={ticket.assignedTo || ''} onChange={(e) => handleAssigneeChange(e.target.value || null)} className="text-sm border-slate-300 rounded-md">
                            <option value="">Unassigned</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

export const SupportManager: React.FC<SupportManagerProps> = ({ tickets, feedback, templates, setTickets, setFeedback, setTemplates, users, currentUser, showToast }) => {
    const [activeTab, setActiveTab] = useState<SupportTab>('tickets');
    const staff = useMemo(() => users.filter(u => ['admin', 'owner', 'support'].includes(u.role)), [users]);
    const [editingTemplate, setEditingTemplate] = useState<QuickReplyTemplate | null>(null);

    const handleUpdateTicket = (updatedTicket: SupportTicket) => {
        const newTickets = tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
        setTickets(newTickets);
        dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'ticket_update', targetType: 'ticket', targetId: updatedTicket.id });
    };

    const handleToggleArchiveFeedback = (id: string) => {
        const newFeedback = feedback.map(f => f.id === id ? { ...f, isArchived: !f.isArchived } : f);
        setFeedback(newFeedback);
    };

    const handleSaveTemplate = () => {
        if (!editingTemplate || !editingTemplate.title.trim() || !editingTemplate.content.trim()) {
            showToast('Title and content cannot be empty.', 'error');
            return;
        }
        const isNew = !templates.some(t => t.id === editingTemplate.id);
        const newTemplates = isNew ? [...templates, editingTemplate] : templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);

        setTemplates(newTemplates);
        showToast(`Template '${editingTemplate.title}' saved!`, 'success');
        setEditingTemplate(null);
    };

    const handleDeleteTemplate = (id: string) => {
        if(window.confirm('Are you sure you want to delete this template?')) {
            const newTemplates = templates.filter(t => t.id !== id);
            setTemplates(newTemplates);
            showToast('Template deleted.', 'success');
        }
    };
    
    const handleNewTemplate = () => {
      setEditingTemplate({id: crypto.randomUUID(), title: '', content: ''});
    }

    const renderTickets = () => (
        <div className="space-y-4">
            {tickets.length > 0 ? tickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} onUpdate={handleUpdateTicket} staff={staff} currentUser={currentUser} templates={templates} />)
             : <p className="text-center text-slate-500 py-8">No support tickets found.</p>
            }
        </div>
    );
    
    const renderFeedback = () => (
        <div className="space-y-3">
            {feedback.length > 0 ? feedback.map(f => (
                <div key={f.id} className={`p-4 border rounded-lg ${f.isArchived ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-slate-800">{f.userName} <span className="text-xs font-normal text-slate-500 capitalize">({f.type})</span></p>
                            <p className="text-sm text-slate-600 mt-1">{f.message}</p>
                        </div>
                        <button onClick={() => handleToggleArchiveFeedback(f.id)} className="text-sm font-medium text-teal-600 hover:text-teal-800">{f.isArchived ? 'Unarchive' : 'Archive'}</button>
                    </div>
                </div>
            )) : <p className="text-center text-slate-500 py-8">No feedback submitted yet.</p>}
        </div>
    );
    
    const renderTemplates = () => (
        <div>
          <button onClick={handleNewTemplate} className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold flex items-center gap-2">{Icons.add} <span>Add New Template</span></button>
          {editingTemplate && (
            <div className="p-4 border rounded-lg bg-slate-50 mb-4 space-y-3 animate-fadeInUp">
              <input value={editingTemplate.title} onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})} placeholder="Template Title" className="w-full p-2 border rounded-md" />
              <textarea value={editingTemplate.content} onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})} placeholder="Template Content..." rows={5} className="w-full p-2 border rounded-md" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingTemplate(null)} className="px-3 py-1 bg-white border rounded-md text-sm">Cancel</button>
                <button onClick={handleSaveTemplate} className="px-3 py-1 bg-teal-600 text-white rounded-md text-sm">Save Template</button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {templates.length > 0 ? templates.map(t => (
                <div key={t.id} className="p-4 border rounded-lg bg-white flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">{t.title}</p>
                        <p className="text-sm text-slate-500 whitespace-pre-line mt-1">{t.content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditingTemplate(t)} className="p-2 text-slate-500 hover:text-teal-600 rounded-full hover:bg-slate-100">{React.cloneElement(Icons.pencil, {className: "h-5 w-5"})}</button>
                        <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100">{React.cloneElement(Icons.trash, {className: "h-5 w-5"})}</button>
                    </div>
                </div>
            )) : <p className="text-center text-slate-500 py-8">No quick reply templates created yet.</p>}
        </div>
      </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'tickets': return renderTickets();
            case 'feedback': return renderFeedback();
            case 'templates': return renderTemplates();
            default: return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800">Support & Feedback</h2>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                    <TabButton label="Tickets" icon={Icons.ticket} isActive={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
                    <TabButton label="Feedback" icon={Icons.inbox} isActive={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
                    <TabButton label="Templates" icon={Icons.book} isActive={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                </div>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};