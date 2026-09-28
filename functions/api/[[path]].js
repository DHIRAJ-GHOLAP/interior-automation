export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Allow preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Target Render backend URL
  const backendBase = (
    context.env?.VITE_API_BASE_URL ||
    context.env?.BACKEND_URL ||
    "https://interior-automation-backend.onrender.com"
  ).replace(/\/$/, "");

  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

  const requestHeaders = new Headers(request.headers);
  try {
    requestHeaders.set("Host", new URL(backendBase).host);
  } catch (e) {
    // ignore
  }

  const init = {
    method: request.method,
    headers: requestHeaders,
    redirect: "follow",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, init);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Backend proxy error", details: err.message }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
