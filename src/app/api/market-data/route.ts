import { NextResponse } from 'next/server';

export async function GET() {
    const CMC_API_KEY = process.env.CMC_API_KEY;

    if (!CMC_API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        // 1. Fetch top 20 listings
        const listingsResponse = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=20',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
                next: { revalidate: 60 },
            }
        );

        const listingsData = await listingsResponse.json();

        if (!listingsResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch listings from CMC' }, { status: listingsResponse.status });
        }

        const coins = listingsData.data;
        const ids = coins.map((coin: any) => coin.id).join(',');

        // 2. Fetch metadata (logos) for these IDs
        const infoResponse = await fetch(
            `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${ids}`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
                next: { revalidate: 3600 }, // Metadata doesn't change often
            }
        );

        const infoData = await infoResponse.json();

        // 3. Merge data
        const marketData = coins.map((coin: any) => ({
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price,
            percentChange24h: coin.quote.USD.percent_change_24h,
            marketCap: coin.quote.USD.market_cap,
            logo: infoData.data[coin.id].logo,
        }));

        return NextResponse.json(marketData);
    } catch (error) {
        console.error('Market data fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
