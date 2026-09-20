export async function POST(req:Request){
  // PayTabs sends the server-to-server callback independently of the browser return.
  // The callback is intentionally accepted here so it can be wired to persistent
  // purchase records later without exposing payment credentials to the browser.
  await req.text();
  return new Response("OK",{status:200});
}
