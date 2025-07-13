import { NextResponse } from 'next/server';
import { HowLongToBeatService, HowLongToBeatEntry } from 'howlongtobeat';

const hltbService = new HowLongToBeatService();

export async function POST(req) {
    const { gameNames } = await req.json();
    
    if (!Array.isArray(gameNames)) {
        return NextResponse.json({ error: 'Expected an array' }, { status: 400 });
    }
    
    try {
        /*
        const results = await Promise.all(
            gameNames.map(name => hltbService.search(name))
        );*/
        const results = await hltbService.search('Nioh');
        console.log(results);
        return NextResponse.json(results);
    } catch (err) {
        console.error(`Error hitting API: ${err}`);
        return NextResponse.json({ error: 'HLTB Search failed' }, { status: 500 });
    }
}