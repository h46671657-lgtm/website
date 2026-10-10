export async function onRequestPut({ env, request, params }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw ? JSON.parse(raw) : { tabs: [], files: {} };

  if (!state.files[params.id]) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const data = await request.json();
  if (data.name) state.files[params.id].name = data.name.trim();
  if (data.tab) state.files[params.id].tab = data.tab;

  await env.VAULT_META.put("state", JSON.stringify(state));
  return Response.json(state.files[params.id]);
}

export async function onRequestDelete({ env, params }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw ? JSON.parse(raw) : { tabs: [], files: {} };

  const f = state.files[params.id];
  if (!f) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await env.VAULT_BUCKET.delete(f.stored);
  delete state.files[params.id];

  await env.VAULT_META.put("state", JSON.stringify(state));
  return Response.json({ ok: true });
}
