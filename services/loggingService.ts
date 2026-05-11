
import type { LogEntry } from '../types';

const LOG_KEY = 'recipepress-logs';
const MAX_LOGS = 50;

function safeStringify(obj: any): string {
    try {
        return JSON.stringify(obj) || '';
    } catch {
        return '';
    }
}

function sanitizeLogPayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;

    try {
        const sanitized = JSON.parse(JSON.stringify(payload));

        const traverseAndSanitize = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            
            // Truncate large arrays
            if (Array.isArray(obj) && obj.length > 5) {
                const originalLength = obj.length;
                obj.length = 5;
                obj.push(`... and ${originalLength - 5} more items removed to save quota ...`);
            }
            
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if ((key === 'image' || key === 'base64') && typeof obj[key] === 'string' && obj[key].length > 100) {
                        obj[key] = `[Base64 removed (${(obj[key].length / 1024).toFixed(2)} KB)]`;
                    } else if (typeof obj[key] === 'string' && obj[key].length > 1000) { 
                        obj[key] = obj[key].substring(0, 1000) + `... [Truncated ${obj[key].length - 1000} chars]`;
                    } else if (typeof obj[key] === 'object') {
                        traverseAndSanitize(obj[key]);
                    }
                }
            }
        };

        traverseAndSanitize(sanitized);
        return sanitized;
    } catch (error) {
        return { error: "Payload could not be sanitized." };
    }
}

export function getLogs(): LogEntry[] {
    try {
        const item = window.localStorage.getItem(LOG_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return [];
    }
}

export function addLog(entryData: Omit<LogEntry, 'id' | 'timestamp'>): void {
    try {
        const logs = getLogs();
        
        const sanitizedEntryData = {
            ...entryData,
            requestPayload: sanitizeLogPayload(entryData.requestPayload),
            response: sanitizeLogPayload(entryData.response),
        };

        const newLog: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...sanitizedEntryData
        };
        
        let updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
        
        // Ensure we don't exceed quota, remove from the end if we fail to save
        while (updatedLogs.length > 0) {
            try {
                window.localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
                break;
            } catch (e) {
                // If quota exceeded, reduce logs list by half and try again
                if (updatedLogs.length === 1) {
                     try {
                         window.localStorage.removeItem(LOG_KEY);
                     } catch(err) {}
                     break; // Give up and clear
                }
                updatedLogs = updatedLogs.slice(0, Math.floor(updatedLogs.length / 2));
            }
        }
    } catch (error) {
        console.error("Failed to add log:", error);
    }
}

export function clearLogs(): void {
    try {
        window.localStorage.removeItem(LOG_KEY);
    } catch (error) {
        console.error("Failed to clear logs:", error);
    }
}
