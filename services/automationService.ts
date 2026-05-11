// FIX: Corrected date-fns imports to use sub-paths for functions not exported from the root module.
import { isAfter } from 'date-fns';
import subDays from 'date-fns/subDays';
import subMonths from 'date-fns/subMonths';
import subWeeks from 'date-fns/subWeeks';
import type { AdminSettings, User, LicenseKey, Notification } from '../types';
import * as dataService from './dataService';
import * as authService from './authService';

/**
 * Checks all license keys and updates the status of any that are expired.
 */
function checkAndCleanupExpiredKeys(
    keys: LicenseKey[],
    settings: AdminSettings
): { updatedKeys: LicenseKey[] | null; logs: Omit<Notification, 'id'>[] } {
    if (!settings.automations.autoDeleteExpiredKeys) {
        return { updatedKeys: null, logs: [] };
    }

    let hasChanged = false;
    const now = new Date();
    const logs: Omit<Notification, 'id'>[] = [];

    const updatedKeys = keys.map(key => {
        if (key.status === 'active' && key.expiresAt && isAfter(now, new Date(key.expiresAt))) {
            hasChanged = true;
            logs.push({
                title: 'System Automation',
                message: `License key ${key.key} has expired and was deactivated.`,
                type: 'info',
                status: 'sent',
                targetGroup: 'all', // This is an admin notification
                timestamp: new Date().toISOString(),
                scheduledAt: null,
                stats: { sent: 1 } // To admin
            });
            dataService.addActivityLog({
                actorId: 'system',
                actorName: 'System Automation',
                action: 'key_expired',
                targetType: 'license_key',
                targetId: key.id,
                details: `Key ${key.key} expired on ${key.expiresAt}.`
            });
            // Fix: Explicitly cast the status to the correct literal type to satisfy TypeScript.
            return { ...key, status: 'expired' as LicenseKey['status'] };
        }
        return key;
    });

    return hasChanged ? { updatedKeys, logs } : { updatedKeys: null, logs: [] };
}


/**
 * Checks for inactive users and sends them a reminder notification.
 */
async function checkAndSendInactiveUserReminders(
    users: User[],
    settings: AdminSettings
): Promise<{ newNotifications: Notification[], updatedUsers: User[] | null }> {
    if (!settings.automations.sendInactiveReminders) {
        return { newNotifications: [], updatedUsers: null };
    }
    
    const threshold = settings.automations.inactiveUserThresholdDays;
    const now = new Date();
    const inactivityDate = subDays(now, threshold);
    let usersWereUpdated = false;

    const newNotifications: Notification[] = [];
    const usersToUpdate: User[] = [];

    users.forEach(user => {
        // Skip admins, owners, or recently reminded users
        if (user.role !== 'user' || (user.lastReminderSentAt && isAfter(new Date(user.lastReminderSentAt), inactivityDate))) {
            return;
        }

        if (isAfter(inactivityDate, new Date(user.lastLogin))) {
            // User is inactive and hasn't been reminded recently
            newNotifications.push({
                id: `inactive-${user.id}-${Date.now()}`,
                title: "We've missed you!",
                message: `It's been a while! Come back and create some amazing new recipes.`,
                type: 'info',
                status: 'sent',
                targetGroup: 'all', // This is a targeted notification, but we can't express that in the current model
                timestamp: now.toISOString(),
                scheduledAt: null,
                stats: { sent: 1 } // Sent to one user
            });
            
            const updatedUser = {...user, lastReminderSentAt: now.toISOString() };
            usersToUpdate.push(updatedUser);
            usersWereUpdated = true;
             dataService.addActivityLog({
                actorId: 'system',
                actorName: 'System Automation',
                action: 'inactive_reminder_sent',
                targetType: 'user',
                targetId: user.id,
                details: `User was inactive for over ${threshold} days.`
            });
        }
    });
    
    // In a real app, this would be a single bulk update. Here we update one by one.
    if(usersWereUpdated) {
        // Persist the changes
        let allUsers = await authService.getAllUsers();
        usersToUpdate.forEach(updatedUser => {
            const index = allUsers.findIndex(u => u.id === updatedUser.id);
            if(index !== -1) {
                allUsers[index] = updatedUser;
            }
        });
        // This is a mock function, in a real scenario this would be an API call
        localStorage.setItem('recipepress-users-db', JSON.stringify(allUsers));
    }


    return { newNotifications, updatedUsers: usersWereUpdated ? usersToUpdate : null };
}

/**
 * Checks for scheduled reports and simulates sending them.
 */
function processScheduledReports(
    settings: AdminSettings
): { newNotifications: Notification[], settingsChanged: boolean, updatedSettings: AdminSettings } {
    if (!settings.scheduledReports || settings.scheduledReports.length === 0) {
        return { newNotifications: [], settingsChanged: false, updatedSettings: settings };
    }

    const now = new Date();
    let settingsChanged = false;
    const newNotifications: Notification[] = [];
    
    const updatedReports = settings.scheduledReports.map(report => {
        let shouldSend = false;
        const lastSent = report.lastSent ? new Date(report.lastSent) : null;

        if (!lastSent) {
            shouldSend = true; // Send immediately if never sent before
        } else {
            if (report.frequency === 'daily' && isAfter(now, subDays(lastSent, -1))) {
                shouldSend = true;
            } else if (report.frequency === 'weekly' && isAfter(now, subWeeks(lastSent, -1))) {
                shouldSend = true;
            } else if (report.frequency === 'monthly' && isAfter(now, subMonths(lastSent, -1))) {
                shouldSend = true;
            }
        }
        
        if (shouldSend) {
            settingsChanged = true;
            // Simulate sending a report by creating a notification for the admin
            newNotifications.push({
                id: `report-${report.id}-${Date.now()}`,
                title: 'Scheduled Report Sent',
                message: `Your scheduled ${report.frequency} ${report.type} report was sent to ${report.recipientEmail}.`,
                type: 'success',
                status: 'sent',
                targetGroup: 'all', // This is an admin-facing notification
                timestamp: now.toISOString(),
                scheduledAt: null,
                stats: { sent: 1 }
            });
            dataService.addActivityLog({
                actorId: 'system',
                actorName: 'System Automation',
                action: 'report_sent',
                details: `Sent ${report.frequency} ${report.type} report to ${report.recipientEmail}.`
            });
            return { ...report, lastSent: now.toISOString() };
        }
        return report;
    });

    const updatedSettings = { ...settings, scheduledReports: updatedReports };
    return { newNotifications, settingsChanged, updatedSettings };
}


/**
 * Runs all enabled automation tasks.
 */
export async function runAutomations(
    settings: AdminSettings,
    users: User[],
    keys: LicenseKey[]
): Promise<{ updatedKeys: LicenseKey[] | null; newNotifications: Notification[]; updatedUsers: User[] | null, settingsChanged: boolean }> {
    const keyCleanupResult = checkAndCleanupExpiredKeys(keys, settings);
    const inactivityResult = await checkAndSendInactiveUserReminders(users, settings);
    const reportResult = processScheduledReports(settings);
    
    const allNewNotifications = [
        ...keyCleanupResult.logs.map(log => ({...log, id: `log-${crypto.randomUUID()}`})), 
        ...inactivityResult.newNotifications,
        ...reportResult.newNotifications
    ];
    
    const settingsHaveChanged = reportResult.settingsChanged;
    if (settingsHaveChanged) {
        dataService.saveAdminSettings(reportResult.updatedSettings);
    }

    return {
        updatedKeys: keyCleanupResult.updatedKeys,
        newNotifications: allNewNotifications,
        updatedUsers: inactivityResult.updatedUsers,
        settingsChanged: settingsHaveChanged
    };
}
