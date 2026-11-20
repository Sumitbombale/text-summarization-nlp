const ORIGIN = "https://YOUR-RENDER-SERVICE.onrender.com";

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, ORIGIN);
    const upstreamRequest = new Request(targetUrl, request);
    const response = await fetch(upstreamRequest);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
