export default async function catchError(event: { req: Request }, next: () => Promise<unknown>) {
  try {
    return await next();
  } catch (err) {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    console.error("[steel]", message);
    return new Response(message, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}