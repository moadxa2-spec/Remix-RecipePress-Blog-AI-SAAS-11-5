
import React from 'react';
import type { Notification } from '../types';
import { Icons } from '../constants';

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const iconMap = {
        info: <div className="p-1 bg-blue-100 rounded-full">{React.cloneElement(Icons.exclamationCircle, {className: "h-5 w-5 text-blue-500"})}</div>,
        success: <div className="p-1 bg-green-100 rounded-full">{React.cloneElement(Icons.check, {className: "h-5 w-5 text-green-500"})}</div>,
        warning: <div className="p-1 bg-yellow-100 rounded-full">{React.cloneElement(Icons.shieldExclamation, {className: "h-5 w-5 text-yellow-500"})}</div>,
    }
    
    return (
        <div className="p-3 hover:bg-slate-100 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{iconMap[notification.type]}</div>
            <div>
                <p className={`text-sm ${notification.read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{notification.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
            </div>
        </div>
    );
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-fadeInUp">
            <div className="p-3 border-b font-semibold text-slate-800">Notifications</div>
            <div className="max-h-96 overflow-y-auto divide-y">
                {notifications.length > 0 ? (
                    notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                ) : (
                    <p className="text-sm text-slate-500 p-4 text-center">No new notifications.</p>
                )}
            </div>
             <div className="p-2 bg-slate-50 text-center">
                <button onClick={onClose} className="text-sm text-teal-600 font-medium hover:underline">Close</button>
            </div>
        </div>
    );
};
