let state = { tabs: [], files: {} };
let activeTab = "default";

async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  return r.json();
}

async function refresh() {
  state = await api("/api/state");
  if (!state.tabs.find(t => t.id === activeTab)) activeTab = state.tabs[0]?.id;
  renderTabs();
  renderFiles();
}

function renderTabs() {
  const el = document.getElementById("tabs");
  el.innerHTML = "";
  state.tabs.forEach(t => {
    const d = document.createElement("div");
    d.className = "tab" + (t.id === activeTab ? " active" : "");

    const n = document.createElement("span");
    n.textContent = t.name;
    n.contentEditable = true;
    n.spellcheck = false;
    n.addEventListener("blur", async () => {
      const v = n.textContent.trim() || t.name;
      await api(`/api/tabs/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v })
      });
      t.name = v;
    });
    n.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); n.blur(); }
    });
    d.appendChild(n);

    d.addEventListener("click", e => {
      if (e.target === n) return;
      activeTab = t.id;
      renderTabs();
      renderFiles();
    });

    if (t.id !== "default") {
      const x = document.createElement("span");
      x.className = "del";
      x.textContent = "\u2715";
      x.addEventListener("click", async e => {
        e.stopPropagation();
        if (!confirm(`Delete tab "${t.name}"?`)) return;
        await api(`/api/tabs/${t.id}`, { method: "DELETE" });
        refresh();
      });
      d.appendChild(x);
    }

    el.appendChild(d);
  });

  const add = document.createElement("button");
  add.className = "new-tab";
  add.textContent = "+ new tab";
  add.onclick = async () => {
    const name = prompt("Tab name:") || "Untitled";
    const t = await api("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    activeTab = t.id;
    refresh();
  };
  el.appendChild(add);
}

function fmtSize(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  if (b < 1073741824) return (b / 1048576).toFixed(1) + " MB";
  return (b / 1073741824).toFixed(2) + " GB";
}

function renderFiles() {
  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";
  const files = Object.values(state.files).filter(f => f.tab === activeTab);

  if (!files.length) {
    grid.innerHTML = '<div class="empty">No files in this tab.</div>';
    return;
  }

  files.forEach(f => {
    const c = document.createElement("div");
    c.className = "file-card";

    const n = document.createElement("div");
    n.className = "name";
    n.textContent = f.name;
    n.contentEditable = true;
    n.spellcheck = false;
    n.addEventListener("blur", async () => {
      const v = n.textContent.trim() || f.name;
      await api(`/api/files/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v })
      });
      f.name = v;
    });
    n.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); n.blur(); }
    });
    c.appendChild(n);

    const m = document.createElement("div");
    m.className = "meta";
    m.textContent = fmtSize(f.size);
    c.appendChild(m);

    const a = document.createElement("div");
    a.className = "actions";

    const dl = document.createElement("button");
    dl.textContent = "download";
    dl.onclick = () => window.location.href = `/api/download/${f.id}`;
    a.appendChild(dl);

    const mv = document.createElement("select");
    state.tabs.forEach(t => {
      const o = document.createElement("option");
      o.value = t.id;
      o.textContent = "\u2192 " + t.name;
      if (t.id === f.tab) o.disabled = true;
      mv.appendChild(o);
    });
    mv.onchange = async () => {
      await api(`/api/files/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: mv.value })
      });
      f.tab = mv.value;
      renderFiles();
    };
    a.appendChild(mv);

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "\u2715";
    del.onclick = async () => {
      if (!confirm(`Delete "${f.name}"?`)) return;
      await api(`/api/files/${f.id}`, { method: "DELETE" });
      refresh();
    };
    a.appendChild(del);

    c.appendChild(a);
    grid.appendChild(c);
  });
}

const dz = document.getElementById("dropzone");
const fi = document.getElementById("fileInput");

dz.onclick = () => fi.click();
fi.onchange = () => uploadFiles(fi.files);

dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("over"); });
dz.addEventListener("dragleave", () => dz.classList.remove("over"));
dz.addEventListener("drop", e => {
  e.preventDefault();
  dz.classList.remove("over");
  uploadFiles(e.dataTransfer.files);
});

async function uploadFiles(files) {
  for (const f of files) {
    const fd = new FormData();
    fd.append("file", f);
    fd.append("name", f.name);
    fd.append("tab", activeTab);
    await fetch("/api/upload", { method: "POST", body: fd });
  }
  refresh();
}

refresh();
