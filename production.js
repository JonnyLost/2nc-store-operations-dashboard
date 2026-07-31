(function () {
  "use strict";

  const CONNECTION_KEY = "store-operations-connection-v1";
  const SESSION_KEY = "store-operations-session-v1";
  const SAVE_DELAY = 800;
  let app;
  let config;
  let session;
  let saveTimer;
  let saving = false;
  let pendingState = null;

  function el(selector) { return document.querySelector(selector); }
  function configured() { return Boolean(config?.supabaseUrl && config?.supabaseAnonKey && config?.storeId); }
  function cleanUrl(value) { return String(value || "").trim().replace(/\/$/, ""); }
  function getConfig() {
    let local = {};
    try { local = JSON.parse(localStorage.getItem(CONNECTION_KEY) || "{}"); } catch {}
    const supplied = window.STORE_OPS_CONFIG || {};
    return {
      supabaseUrl: cleanUrl(local.supabaseUrl || supplied.supabaseUrl),
      supabaseAnonKey: String(local.supabaseAnonKey || supplied.supabaseAnonKey || "").trim(),
      storeId: String(local.storeId || supplied.storeId || "2102").trim(),
    };
  }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
  }
  function setSession(next) {
    session = next;
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  }
  function authHeaders(token = session?.access_token) {
    return {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token || config.supabaseAnonKey}`,
      "Content-Type": "application/json",
    };
  }
  async function request(path, options = {}) {
    let response = await fetch(`${config.supabaseUrl}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    if (response.status === 401 && session?.refresh_token && !path.includes("grant_type=refresh_token")) {
      const refreshed = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST", headers: authHeaders(config.supabaseAnonKey), body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (refreshed.ok) {
        setSession(await refreshed.json());
        response = await fetch(`${config.supabaseUrl}${path}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
      }
    }
    return response;
  }
  function codedError(message, code) {
    const error = new Error(message); error.code = code; return error;
  }
  function jwtPayload() {
    try {
      const encoded = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    } catch { return {}; }
  }
  function setStatus(kind, title, detail) {
    el("#sync-status-title").textContent = title;
    el("#sync-status-detail").textContent = detail;
    el(".status-dot").className = `status-dot ${kind || ""}`.trim();
  }
  function setNote(kind, html) {
    const note = el("#environment-note");
    note.className = `prototype-note ${kind || ""}`.trim();
    note.innerHTML = html;
  }
  function showGate(message = "") {
    el("#auth-gate").hidden = false;
    el("#auth-message").textContent = message;
  }
  function hideGate() { el("#auth-gate").hidden = true; }
  function parseAuthCallback() {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (!hash.get("access_token")) return false;
    setSession({
      access_token: hash.get("access_token"), refresh_token: hash.get("refresh_token"),
      expires_at: Math.floor(Date.now() / 1000) + Number(hash.get("expires_in") || 3600),
      token_type: hash.get("token_type") || "bearer",
    });
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    return true;
  }
  async function verifyMembership() {
    const response = await request(`/rest/v1/store_members?store_id=eq.${encodeURIComponent(config.storeId)}&select=role,user_id`);
    if (response.status === 401) throw codedError("Your secure sign-in has expired. Request a new link.", "AUTH_REQUIRED");
    if (!response.ok) throw codedError("Secure sync is temporarily unavailable.", "SYNC_UNAVAILABLE");
    const rows = await response.json();
    return rows[0] || null;
  }
  async function loadCloudState() {
    setStatus("syncing", "Connecting", "Loading secure store data…");
    const membership = await verifyMembership();
    if (!membership) throw codedError("This account is not approved for Store 2102.", "NOT_AUTHORIZED");
    const response = await request(`/rest/v1/store_states?store_id=eq.${encodeURIComponent(config.storeId)}&select=payload,updated_at&limit=1`);
    if (!response.ok) throw codedError("The secure store data could not be loaded.", "SYNC_UNAVAILABLE");
    const rows = await response.json();
    if (rows[0]?.payload) app.replaceState(rows[0].payload, "Secure store data loaded.");
    else await saveCloudState(app.getState(), true);
    hideGate();
    setStatus("", "Secure sync active", "Saved across approved devices");
    setNote("production-note", `<strong>Production pilot:</strong> Store ${config.storeId} data is protected by sign-in and synchronized securely. Changes also keep a recovery copy on this device.`);
    el("#account-menu").textContent = "Account";
  }
  async function saveCloudState(nextState, initial = false) {
    if (!configured() || !session) return;
    saving = true;
    setStatus("syncing", "Saving", "Synchronizing changes…");
    try {
      const response = await request("/rest/v1/store_states?on_conflict=store_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ store_id: config.storeId, payload: nextState, updated_by: membershipUserId() }),
      });
      if (!response.ok) throw new Error(await response.text());
      setStatus("", "Secure sync active", initial ? "Initial store record created" : `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (error) {
      console.error(error);
      setStatus("offline", "Saved locally", "Cloud sync will retry");
      setNote("sync-warning", "<strong>Connection interrupted:</strong> your changes are safe on this device and will sync after you reconnect.");
    } finally {
      saving = false;
      if (pendingState && pendingState !== nextState) {
        const queued = pendingState; pendingState = null; saveCloudState(queued);
      }
    }
  }
  function membershipUserId() {
    return jwtPayload().sub || null;
  }
  function queueSave(nextState) {
    if (!configured() || !session) return;
    pendingState = nextState;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const queued = pendingState; pendingState = null;
      if (saving) { pendingState = queued; return; }
      saveCloudState(queued);
    }, SAVE_DELAY);
  }
  async function sendMagicLink(email) {
    const redirect = `${location.origin}${location.pathname}`;
    const response = await fetch(`${config.supabaseUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
      method: "POST", headers: authHeaders(config.supabaseAnonKey),
      body: JSON.stringify({ email, create_user: false }),
    });
    if (!response.ok) throw new Error("That email is not approved, or the sign-in service is unavailable.");
  }
  function signOut() {
    if (session) request("/auth/v1/logout", { method: "POST" }).catch(() => {});
    setSession(null);
    location.reload();
  }
  function download(name, contents, type = "application/json") {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  function exportBackup(currentState) {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`Store-${currentState.store?.number || config.storeId}-Backup-${stamp}.json`, JSON.stringify({ format: "2nc-store-operations", version: 1, exportedAt: new Date().toISOString(), state: currentState }, null, 2));
    app.showToast("Portable backup downloaded.");
  }
  async function createCloudBackup(currentState) {
    if (!configured() || !session) { app.showToast("Connect secure sync before creating a cloud backup."); return; }
    const response = await request("/rest/v1/store_backups", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ store_id: config.storeId, payload: currentState, created_by: membershipUserId() }),
    });
    if (!response.ok) { app.showToast("Cloud backup could not be created."); return; }
    const time = new Date().toLocaleString();
    el("#last-cloud-backup").textContent = `Last cloud backup created ${time}.`;
    app.showToast("Dated cloud backup created.");
  }
  function dialogContent() {
    const connected = configured();
    const email = session ? jwtPayload().email || "Approved user" : "Not signed in";
    return `<div class="production-dialog-content">
      <span class="production-badge">${connected ? "Production connection saved" : "One-time setup"}</span>
      <h2>${connected ? "Account & secure sync" : "Connect the production pilot"}</h2>
      <p>${connected ? "This device is connected to the protected Store Operations database." : "Create the database using the included setup guide, then enter its public connection values here."}</p>
      ${connected ? `<div class="account-summary"><strong>${email}</strong><br><span>Store ${config.storeId} · owner/manager access</span></div>` : `
      <form id="connection-form" class="fields connection-form">
        <label>Supabase project URL<input name="url" type="url" placeholder="https://your-project.supabase.co" required></label>
        <label>Public anon key<input name="key" type="password" autocomplete="off" required></label>
        <label>Store number<input name="store" value="${config.storeId || "2102"}" required></label>
        <button type="submit" class="button primary">Save secure connection</button>
      </form>`}
      <div class="button-row">
        ${connected && session ? `<button type="button" class="button secondary" id="dialog-cloud-backup">Create cloud backup</button><button type="button" class="button secondary" id="dialog-sign-out">Sign out</button>` : ""}
        ${connected ? `<button type="button" class="button secondary" id="forget-connection">Forget connection on this device</button>` : ""}
      </div>
    </div>`;
  }
  function openAccount() {
    const dialog = el("#production-dialog");
    el("#production-dialog-content").outerHTML = `<div id="production-dialog-content">${dialogContent()}</div>`;
    dialog.showModal();
  }
  function bindUi() {
    el("#sign-in-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = el("#auth-message"); message.textContent = "Sending your secure link…";
      try { await sendMagicLink(el("#sign-in-email").value.trim()); message.textContent = "Check your email and open the sign-in link on this device."; }
      catch (error) { message.textContent = error.message; }
    });
    el("#production-dialog").addEventListener("click", async (event) => {
      if (event.target.id === "dialog-sign-out") signOut();
      if (event.target.id === "dialog-cloud-backup") createCloudBackup(app.getState());
      if (event.target.id === "forget-connection" && confirm("Forget the production connection on this device? Your cloud data will not be deleted.")) {
        localStorage.removeItem(CONNECTION_KEY); localStorage.removeItem(SESSION_KEY); location.reload();
      }
    });
    el("#production-dialog").addEventListener("submit", (event) => {
      if (event.target.id !== "connection-form") return;
      event.preventDefault();
      const form = new FormData(event.target);
      const next = { supabaseUrl: cleanUrl(form.get("url")), supabaseAnonKey: String(form.get("key") || "").trim(), storeId: String(form.get("store") || "2102").trim() };
      localStorage.setItem(CONNECTION_KEY, JSON.stringify(next));
      location.reload();
    });
    addEventListener("online", () => { if (session) loadCloudState().catch(() => setStatus("offline", "Saved locally", "Reconnect to sync")); });
    addEventListener("offline", () => setStatus("offline", "Offline", "Changes stay safe on this device"));
  }
  async function init(appApi) {
    app = appApi; config = getConfig(); session = getSession(); bindUi();
    parseAuthCallback(); session = getSession();
    if (!configured()) {
      setStatus("", "Demo mode", "Production setup required");
      setNote("", "<strong>Safe demo mode:</strong> sample information is stored only in this browser. Connect the secure pilot database before entering real store or associate information.");
      return;
    }
    if (!session) { showGate(); return; }
    try { await loadCloudState(); }
    catch (error) {
      if (["AUTH_REQUIRED", "NOT_AUTHORIZED"].includes(error.code)) {
        setSession(null); showGate(error.message); return;
      }
      hideGate();
      setStatus("offline", "Saved locally", "Secure sync will retry");
      setNote("sync-warning", "<strong>Secure sync is unavailable:</strong> the last protected copy remains on this device. You can continue working and changes will upload after the connection returns.");
    }
  }

  window.StoreOpsProduction = { init, queueSave, openAccount, exportBackup, createCloudBackup };
})();
