import { HowLongToBeatService } from "@btylerw/howlongtobeat";

const hltbService = new HowLongToBeatService();

export async function getHLTBInfo(gameNames) {
    const results = await Promise.all(
        gameNames.map(name => hltbService.search(name))
    );
    return results;
}