export default async function handler(req: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { code, redirect_uri } = body;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Missing Authorization header', { status: 401, headers: corsHeaders });
        }

        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        formData.append('redirect_uri', redirect_uri);

        const pinterestRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader
            },
            body: formData.toString()
        });

        const data = await pinterestRes.json();
        
        return new Response(JSON.stringify(data), {
            status: pinterestRes.status,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
    }
}
