import type { LogEntry } from '../types';

const API_ENDPOINT = '/functions/api/logs';

export async function getLogs(apiToken: string): Promise<LogEntry[]> {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch logs' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json() as LogEntry[];
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while fetching logs.');
    }
}

export async function clearLogs(apiToken: string): Promise<{ message: string }> {
     try {
        const response = await fetch(API_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to clear logs' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error clearing logs:", error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while clearing logs.');
    }
}