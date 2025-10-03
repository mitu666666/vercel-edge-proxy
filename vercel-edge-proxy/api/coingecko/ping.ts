export const config = { runtime: 'edge' };

export default async function handler() {
  const upstream = 'https://api.coingecko.com/api/v3/ping';
  try {
    const res = await fetch(upstream, { headers: { 'user-agent': 'Mozilla/5.0' } });
    return new Response(res.body, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/json',
        'cache-control': 'public, s-maxage=15'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'upstream_error', message: String(e) }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    });
  }
}