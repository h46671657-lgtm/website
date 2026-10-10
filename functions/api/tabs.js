export async function onRequestPost({ env, request }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw
    ? JSON.parse(raw)
    : { tabs: [{ id: "default", name: "Main" }], files: {} };

  const data = await request.json();
  const name = (data.name || "Untitled").trim();
  const tid = crypto.randomUUID().slice(0, 8);

  state.tabs.push({ id: tid, name });
  await env.VAULT_META.put("state", JSON.stringify(state));

  return Response.json({ id: tid, name });
}
