export async function onRequestPost({ env, request }) {
  const form = await request.formData();
  const file = form.get("file");
  const tab = form.get("tab") || "default";
  const name = (form.get("name") || file.name || "file").trim();

  if (!file) {
    return Response.json({ error: "no file" }, { status: 400 });
  }

  const fid = crypto.randomUUID().replace(/-/g, "");
  const key = fid;

  await env.VAULT_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" }
  });

  const raw = await env.VAULT_META.get("state");
  const state = raw
    ? JSON.parse(raw)
    : { tabs: [{ id: "default", name: "Main" }], files: {} };

  state.files[fid] = {
    id: fid,
    name,
    stored: key,
    tab,
    size: file.size,
    type: file.type || "application/octet-stream"
  };

  await env.VAULT_META.put("state", JSON.stringify(state));
  return Response.json(state.files[fid]);
}
