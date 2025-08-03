import { updateSync } from "@/app/lib/user";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get('userid');
    try {
        await updateSync(userid);
        return new Response(JSON.stringify({ message: 'Sync updated successfully' }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Error updating sync date' }), { status: 500 });
    }
}