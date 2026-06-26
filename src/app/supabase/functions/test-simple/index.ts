import { Hono } from "jsr:@hono/hono@4";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ 
    status: "ok",
    message: "Simple test works!",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (c) => {
  return c.json({ 
    status: "ok",
    route: "/health works!"
  });
});

app.all("*", (c) => {
  console.log("Catch-all:", c.req.method, c.req.url, c.req.path);
  return c.json({
    error: "Not found",
    method: c.req.method,
    url: c.req.url,
    path: c.req.path
  }, 404);
});

Deno.serve(app.fetch);
