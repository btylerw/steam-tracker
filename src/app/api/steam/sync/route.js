import { updateSync } from "@/app/lib/user";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get('userid');
    const force = searchParams.get('force');
    try {
        await updateSync(userid, force);
        return new Response(JSON.stringify({ message: 'Sync updated successfully' }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Error updating sync date' }), { status: 500 });
    }
}