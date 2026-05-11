
import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../types';

interface ToastProps {
    message: ToastMessage | null;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            if (!message.persistent) {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setTimeout(onClose, 300); // Allow fade-out animation to complete
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            setVisible(false);
        }
    }, [message, onClose]);

    if (!message) {
        return null;
    }

    const toastStyles = {
        success: {
            bg: 'bg-white',
            border: 'border-green-400',
            text: 'text-green-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-400',
            text: 'text-red-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 101.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
        }
    }

    const handleActionClick = () => {
        if (message.action) {
            message.action.onClick();
        }
        setVisible(false);
        setTimeout(onClose, 300);
    };
    
    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    }

    const { bg, border, text, icon } = toastStyles[message.type];

    return (
        <div 
            className={`fixed top-5 right-5 z-50 flex items-start p-4 rounded-xl shadow-lg border-l-4 transition-all duration-300 ${bg} ${border} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
            role="alert"
        >
            <div className="flex-shrink-0 pt-0.5">
                {icon}
            </div>
            <div className="ml-3 flex-1">
                <p className={`text-sm font-semibold ${text}`}>{message.message}</p>
                {message.action && (
                    <button onClick={handleActionClick} className={`mt-2 text-sm font-bold ${text} opacity-80 hover:opacity-100 focus:outline-none`}>
                        {message.action.label}
                    </button>
                )}
            </div>
            {(message.persistent || message.action) && (
                 <button onClick={handleClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/20 ${text} opacity-60 hover:opacity-100`}>
                    <span className="sr-only">Dismiss</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            )}
        </div>
    );
};
