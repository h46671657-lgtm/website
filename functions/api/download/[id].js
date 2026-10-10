export async function onRequestGet({ env, params }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw ? JSON.parse(raw) : { tabs: [], files: {} };

  const f = state.files[params.id];
  if (!f) return new Response("not found", { status: 404 });

  const obj = await env.VAULT_BUCKET.get(f.stored);
  if (!obj) return new Response("missing blob", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type": f.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(f.name)}"`,
      "Content-Length": String(f.size)
    }
  });
}
