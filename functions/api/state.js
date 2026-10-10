export async function onRequestGet({ env }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw
    ? JSON.parse(raw)
    : { tabs: [{ id: "default", name: "Main" }], files: {} };
  return Response.json(state);
}
