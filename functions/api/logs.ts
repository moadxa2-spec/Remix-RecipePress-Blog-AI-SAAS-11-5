import { Redis } from "@upstash/redis";
import type { LogEntry } from '../../types';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const LOG_KEY = 'recipepress_api_logs';

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Authenticate the request from the app frontend
    const appToken = process.env.RECIPEPRESS_APP_TOKEN;
    const authHeader = req.headers.get('Authorization');
    const sentToken = authHeader?.split('Bearer ')?.[1];

    if (!appToken || !sentToken || appToken !== sentToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!redis) {
         return new Response(JSON.stringify({ error: 'Server configuration error: Redis not configured.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        if (req.method === 'GET') {
            const logStrings = await redis.lrange(LOG_KEY, 0, -1);
            const logs: LogEntry[] = logStrings.map(log => JSON.parse(log as string));
            return new Response(JSON.stringify(logs), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (req.method === 'DELETE') {
            await redis.del(LOG_KEY);
            return new Response(JSON.stringify({ message: 'Logs cleared successfully' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in API logs function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: 'Failed to process log request.', details: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}