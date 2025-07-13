import { NextResponse } from 'next/server';
import { HowLongToBeatService } from '@btylerw/howlongtobeat';

const hltbService = new HowLongToBeatService();

export async function POST(req) {
    const { gameNames } = await req.json();
    
    if (!Array.isArray(gameNames)) {
        return NextResponse.json({ error: 'Expected an array' }, { status: 400 });
    }
    
    try {
        const results = await Promise.all(
            gameNames.map(name => hltbService.search(name))
        );
        return NextResponse.json(results);
    } catch (err) {
        console.error(`Error hitting API: ${err}`);
        return NextResponse.json({ error: 'HLTB Search failed' }, { status: 500 });
    }
}