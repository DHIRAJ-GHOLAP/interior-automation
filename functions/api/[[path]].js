export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Fast preflight CORS handling
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

  // Render backend URL
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

  // Clone body for potential retries if not GET/HEAD
  let bodyBuffer = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      bodyBuffer = await request.arrayBuffer();
    } catch (e) {
      bodyBuffer = null;
    }
  }

  // Retry loop: Handles Render free-tier cold start / wake-up delay
  let lastError = null;
  let lastResponse = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const init = {
        method: request.method,
        headers: requestHeaders,
        redirect: "follow",
      };

      if (bodyBuffer) {
        init.body = bodyBuffer;
      }

      const response = await fetch(targetUrl, init);

      // If Render returns 502/503 while spinning up from sleep, wait and retry
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        continue;
      }

      // Success or normal response from backend
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
      lastError = err;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }
  }

  // Fallback if Render fails to respond after 3 attempts
  return new Response(
    JSON.stringify({
      error: "Backend is currently waking up",
      message: "Render service is initializing. Please refresh in a few seconds.",
      details: lastError ? lastError.message : "Service timeout",
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Retry-After": "10",
      },
    }
  );
}
