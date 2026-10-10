export async function onRequestPut({ env, request, params }) {
  const raw = await env.VAULT_META.get("state");
  const state = raw ? JSON.parse(raw) : { tabs: [], files: {} };
  const data = await request.json();

  for (const t of state.tabs) {
    if (t.id === params.id) {
      t.name = (data.name || t.name).trim();
    }
  }

  await env.VAULT_META.put("state", JSON.stringify(state));
  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  if (params.id === "default") {
    return Response.json({ error: "cannot delete default" }, { status: 400 });
  }

  const raw = await env.VAULT_META.get("state");
  const state = raw ? JSON.parse(raw) : { tabs: [], files: {} };

  state.tabs = state.tabs.filter(t => t.id !== params.id);
  for (const f of Object.values(state.files)) {
    if (f.tab === params.id) f.tab = "default";
  }

  await env.VAULT_META.put("state", JSON.stringify(state));
  return Response.json({ ok: true });
}
