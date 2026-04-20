import { fetchWithRetry } from '../../../lib/fetchWithRetry';

 {
    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) {
        console.error("OPENAI_API_KEY is missing from environment variables.");
        return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key' }), { status: 500 });
    }

    try {
        const body = await req.json();
        console.log('Attempting forecast request...'); // Debug log

        const res = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: body.input }]
            }),
        }, { retries: 3 });

        const text = await res.text();
        console.log('API Response Status:', res.status); // Debug log

        if (!res.ok) {
            console.error('API Error:', res.status, text);
            return new Response(JSON.stringify({ 
                error: 'Failed to retrieve forecast', 
                status: res.status,
                details: text 
            }), { status: res.status });
        }

        const json = JSON.parse(text);
        return new Response(JSON.stringify({ forecast: json }), { status: 200 });
    } catch (err) {
        console.error('Request failed:', err);
        return new Response(JSON.stringify({ 
            error: 'Failed to retrieve forecast - network error',
            details: err instanceof Error ? err.message : String(err)
        }), { status: 502 });
    }
}