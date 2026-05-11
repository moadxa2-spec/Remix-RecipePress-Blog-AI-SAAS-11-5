

import React, { useState, useRef, useEffect } from 'react';
import type { View, SettingsTab, User, Notification } from '../types';
import { Icons } from '../constants';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  currentView: View;
  setView: (view: View, tab?: SettingsTab) => void;
  currentUser: User | null;
  logout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  appName: string;
  logoUrl: string | null;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-600 font-semibold'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    {React.cloneElement(icon, { className: "h-5 w-5" })}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const UserMenu: React.FC<{ user: User; setView: (view: View, tab?: SettingsTab) => void; logout: () => void }> = ({ user, setView, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 transition-colors">
        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-fadeInUp">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
            </div>
            {user.plan === 'free' && (
              <a href="#" onClick={(e) => { e.preventDefault(); setView('pricing'); setIsOpen(false); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Upgrade to Pro</a>
            )}
            {(user.role === 'admin' || user.role === 'owner') && (
              <a href="#" onClick={(e) => { e.preventDefault(); setView('admin'); setIsOpen(false); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Admin Panel</a>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="text-red-600 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Log Out</a>
          </div>
        </div>
      )}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser, logout, notifications, setNotifications, appName, logoUrl }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const hasUnread = notifications.some(n => !n.read);

  const handleNotificationClick = () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      // Mark all as read when opening
      setNotifications(notifications.map(n => ({...n, read: true})));
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setView(currentUser ? 'dashboard' : 'landing')} className="flex items-center gap-3 focus:outline-none">
            {logoUrl ? (
                <img src={logoUrl} alt={`${appName} logo`} className="h-9 w-auto object-contain" />
            ) : (
                <div className="flex items-center justify-center h-9 w-9 bg-teal-600 rounded-lg flex-shrink-0">
                    <span className="font-bold text-white text-xl">{appName.charAt(0)}</span>
                </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight hidden sm:block">
              {appName}
            </h1>
          </button>
          <nav className="flex items-center gap-1 sm:gap-2">
            {currentUser ? (
              <>
                <NavButton label="Generator" icon={Icons.book} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                <NavButton label="History" icon={Icons.history} isActive={currentView === 'history'} onClick={() => setView('history')} />
                <NavButton label="Corrections" icon={Icons.photo} isActive={currentView === 'corrections'} onClick={() => setView('corrections')} />
                <NavButton label="Settings" icon={Icons.cog} isActive={currentView === 'settings'} onClick={() => setView('settings')} />
                <div className="relative">
                  <button onClick={handleNotificationClick} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 relative">
                      {Icons.bell}
                      {hasUnread && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                  </button>
                  {showNotifications && <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} />}
                </div>
                <UserMenu user={currentUser} setView={setView} logout={logout} />
              </>
            ) : (
              <>
                <button onClick={() => setView('login')} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Log In</button>
                <button onClick={() => setView('signup')} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">Sign Up</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};