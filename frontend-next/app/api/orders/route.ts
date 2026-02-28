// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Vi sikrer os at vi rammer den rigtige port og den rigtige base-sti
        // Hvis din NEXT_PUBLIC_API_URL er http://localhost:3000/api, så er det perfekt.
        // Hvis den bare er http://localhost:3000, så tilføjer vi /api herunder.
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        const body = await req.json();
        const cookie = req.headers.get('cookie') || '';

        // Vi bygger den fulde sti.
        // Vi bruger /api/orders/create fordi din Express app.use('/api/orders') + router.post('/create') kræver det.
        // Hvis din baseUrl allerede slutter på /api, skal vi passe på ikke at skrive det to gange.

        const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
        const targetUrl = `${cleanBaseUrl}/orders/create`;

        console.log(`🚀 Send anmodning til: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Backend fejl:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("❌ Proxy fejl:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}