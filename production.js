(function () {
  "use strict";

  const CONNECTION_KEY = "store-operations-connection-v1";
  const SESSION_KEY = "store-operations-session-v1";
  const APP_STATE_KEY = "store-operations-production-v1";
  const SAVE_DELAY = 800;
  let app;
  let config;
  let session;
  let membership = null;
  let saveTimer;
  let saving = false;
  let pendingState = null;

  function el(selector) { return document.querySelector(selector); }
  function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function configured() { return Boolean(config?.supabaseUrl && config?.supabaseAnonKey && config?.storeId); }
  function cleanUrl(value) { return String(value || "").trim().replace(/\/$/, ""); }
  function isOwner() { return membership?.role === "owner"; }
  function can(section) {
    if (isOwner()) return true;
    return section === "payroll" ? Boolean(membership?.can_view_payroll) : Boolean(membership?.can_view_communications);
  }
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
    let response = await fetch(`${config.supabaseUrl}${path}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
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
  function codedError(message, code) { const error = new Error(message); error.code = code; return error; }
  function jwtPayload() {
    try {
      const encoded = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    } catch { return {}; }
  }
  function membershipUserId() { return jwtPayload().sub || null; }
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
  function showGate(message = "") { el("#auth-gate").hidden = false; el("#auth-message").textContent = message; }
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
    const response = await request(`/rest/v1/store_access?store_id=eq.${encodeURIComponent(config.storeId)}&select=role,email,can_view_payroll,can_view_communications,active`);
    if (response.status === 401) throw codedError("Your secure sign-in has expired. Request a new link.", "AUTH_REQUIRED");
    if (!response.ok) throw codedError("Secure sync is temporarily unavailable.", "SYNC_UNAVAILABLE");
    const rows = await response.json();
    return rows.find((row) => row.active) || null;
  }

  function scrubWeekPayroll(week) {
    if (!week) return;
    (week.budgets || []).forEach((row) => { row.payrollBudget = 0; });
    if (week.results) week.results.actualHours = {};
    if (week.beforeToday) week.beforeToday.payrollCost = 0;
  }
  function generalState(currentState) {
    const next = clone(currentState);
    (next.associates || []).forEach((associate) => { associate.payRate = 0; });
    (next.budgets || []).forEach((row) => { row.payrollBudget = 0; });
    if (next.results) next.results.actualHours = {};
    if (next.beforeToday) next.beforeToday.payrollCost = 0;
    Object.values(next.weeks || {}).forEach(scrubWeekPayroll);
    next.communications = [];
    next.reportSnapshots = [];
    return next;
  }
  function payrollState(currentState) {
    return {
      associates: (currentState.associates || []).map((associate) => ({ name: associate.name, payRate: Number(associate.payRate || 0) })),
      budgets: (currentState.budgets || []).map((row) => ({ date: row.date, payrollBudget: Number(row.payrollBudget || 0) })),
      resultsActualHours: clone(currentState.results?.actualHours || {}),
      beforeTodayPayrollCost: Number(currentState.beforeToday?.payrollCost || 0),
      weeks: Object.fromEntries(Object.entries(currentState.weeks || {}).map(([key, week]) => [key, {
        budgets: (week.budgets || []).map((row) => ({ date: row.date, payrollBudget: Number(row.payrollBudget || 0) })),
        resultsActualHours: clone(week.results?.actualHours || {}),
        beforeTodayPayrollCost: Number(week.beforeToday?.payrollCost || 0),
      }])),
    };
  }
  function applyPayrollState(target, privateState = {}) {
    const rates = new Map((privateState.associates || []).map((row) => [row.name, Number(row.payRate || 0)]));
    (target.associates || []).forEach((associate) => { associate.payRate = rates.get(associate.name) || 0; });
    const budgets = new Map((privateState.budgets || []).map((row) => [row.date, Number(row.payrollBudget || 0)]));
    (target.budgets || []).forEach((row) => { row.payrollBudget = budgets.get(row.date) || 0; });
    if (target.results) target.results.actualHours = clone(privateState.resultsActualHours || {});
    if (target.beforeToday) target.beforeToday.payrollCost = Number(privateState.beforeTodayPayrollCost || 0);
    Object.entries(privateState.weeks || {}).forEach(([key, weekPrivate]) => {
      const week = target.weeks?.[key];
      if (!week) return;
      const weekBudgets = new Map((weekPrivate.budgets || []).map((row) => [row.date, Number(row.payrollBudget || 0)]));
      (week.budgets || []).forEach((row) => { row.payrollBudget = weekBudgets.get(row.date) || 0; });
      if (week.results) week.results.actualHours = clone(weekPrivate.resultsActualHours || {});
      if (week.beforeToday) week.beforeToday.payrollCost = Number(weekPrivate.beforeTodayPayrollCost || 0);
    });
  }
  function applyPrivateSections(target, rows) {
    rows.forEach((row) => {
      if (row.section === "payroll") applyPayrollState(target, row.payload);
      if (row.section === "communications") target.communications = clone(row.payload?.communications || []);
      if (row.section === "owner") target.reportSnapshots = clone(row.payload?.reportSnapshots || []);
    });
    return target;
  }
  async function loadCloudState() {
    setStatus("syncing", "Connecting", "Loading secure store data…");
    membership = await verifyMembership();
    if (!membership) throw codedError("This email has not been approved for Store 2102.", "NOT_AUTHORIZED");
    app.setAccess({ role: membership.role, canViewPayroll: can("payroll"), canViewCommunications: can("communications") });
    const response = await request(`/rest/v1/store_states?store_id=eq.${encodeURIComponent(config.storeId)}&select=payload,updated_at&limit=1`);
    if (!response.ok) throw codedError("The secure store data could not be loaded.", "SYNC_UNAVAILABLE");
    const rows = await response.json();
    if (rows[0]?.payload) {
      const privateResponse = await request(`/rest/v1/store_private_states?store_id=eq.${encodeURIComponent(config.storeId)}&select=section,payload`);
      const privateRows = privateResponse.ok ? await privateResponse.json() : [];
      app.replaceState(applyPrivateSections(clone(rows[0].payload), privateRows), "Secure store data loaded.");
    } else {
      await saveCloudState(app.getState(), true);
    }
    hideGate();
    setStatus("", "Secure sync active", "Saved across approved devices");
    const permissionText = isOwner() ? "Owner access" : [can("payroll") && "Payroll", can("communications") && "Communication Log"].filter(Boolean).join(" + ") || "Standard manager access";
    setNote("production-note", `<strong>Production pilot:</strong> Store ${esc(config.storeId)} is securely synchronized. ${esc(permissionText)} is active for this account.`);
    el("#account-menu").textContent = "Account";
  }
  async function upsertPrivate(section, payload) {
    const response = await request("/rest/v1/store_private_states?on_conflict=store_id,section", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ store_id: config.storeId, section, payload, updated_by: membershipUserId() }),
    });
    if (!response.ok) throw new Error(await response.text());
  }
  async function saveCloudState(nextState, initial = false) {
    if (!configured() || !session || !membership) return;
    saving = true;
    setStatus("syncing", "Saving", "Synchronizing changes…");
    try {
      const response = await request("/rest/v1/store_states?on_conflict=store_id", {
        method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ store_id: config.storeId, payload: generalState(nextState), updated_by: membershipUserId() }),
      });
      if (!response.ok) throw new Error(await response.text());
      const privateWrites = [];
      if (can("payroll")) privateWrites.push(upsertPrivate("payroll", payrollState(nextState)));
      if (can("communications")) privateWrites.push(upsertPrivate("communications", { communications: clone(nextState.communications || []) }));
      if (isOwner()) privateWrites.push(upsertPrivate("owner", { reportSnapshots: clone(nextState.reportSnapshots || []) }));
      await Promise.all(privateWrites);
      setStatus("", "Secure sync active", initial ? "Initial store record created" : `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (error) {
      console.error(error);
      setStatus("offline", "Saved locally", "Cloud sync will retry");
      setNote("sync-warning", "<strong>Connection interrupted:</strong> your changes are safe on this device and will sync after you reconnect.");
    } finally {
      saving = false;
      if (pendingState && pendingState !== nextState) { const queued = pendingState; pendingState = null; saveCloudState(queued); }
    }
  }
  function queueSave(nextState) {
    if (!configured() || !session || !membership) return;
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
      body: JSON.stringify({ email, create_user: true }),
    });
    if (!response.ok) throw new Error("The secure sign-in link could not be sent.");
  }
  function signOut() {
    if (session) request("/auth/v1/logout", { method: "POST" }).catch(() => {});
    setSession(null); localStorage.removeItem(APP_STATE_KEY); location.reload();
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
    if (!isOwner()) { app.showToast("Cloud backups are available to the owner."); return; }
    const response = await request("/rest/v1/store_backups", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ store_id: config.storeId, payload: currentState, created_by: membershipUserId() }),
    });
    if (!response.ok) { app.showToast("Cloud backup could not be created."); return; }
    const time = new Date().toLocaleString();
    el("#last-cloud-backup").textContent = `Last cloud backup created ${time}.`;
    app.showToast("Dated cloud backup created.");
  }
  async function loadAccessManager() {
    const container = el("#manager-access-list");
    if (!container || !isOwner()) return;
    const response = await request(`/rest/v1/store_access?store_id=eq.${encodeURIComponent(config.storeId)}&select=email,role,can_view_payroll,can_view_communications,active&order=role.asc,email.asc`);
    if (!response.ok) { container.innerHTML = "<p>Manager access could not be loaded.</p>"; return; }
    const rows = await response.json();
    container.innerHTML = rows.map((row) => `<div class="manager-access-row">
      <div><strong>${esc(row.email)}</strong><span>${row.role === "owner" ? "Owner" : row.active ? "Manager" : "Access removed"}</span></div>
      <div class="permission-tags"><span class="${row.can_view_payroll || row.role === "owner" ? "active" : ""}">Payroll</span><span class="${row.can_view_communications || row.role === "owner" ? "active" : ""}">Communication Log</span></div>
      ${row.role === "manager" ? `<button type="button" class="remove-button remove-manager-access" data-email="${esc(row.email)}" aria-label="Remove ${esc(row.email)}">×</button>` : ""}
    </div>`).join("");
  }
  async function saveManagerAccess(formElement) {
    const data = new FormData(formElement);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const payload = {
      store_id: config.storeId, email, role: "manager", active: true,
      can_view_payroll: data.get("payroll") === "on",
      can_view_communications: data.get("communications") === "on",
    };
    const response = await request("/rest/v1/store_access?on_conflict=store_id,email", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Manager access could not be saved.");
    formElement.reset(); await loadAccessManager();
    app.showToast("Manager access saved. They can request a sign-in link now.");
  }
  async function removeManagerAccess(email) {
    const response = await request(`/rest/v1/store_access?store_id=eq.${encodeURIComponent(config.storeId)}&email=eq.${encodeURIComponent(email)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Manager access could not be removed.");
    await loadAccessManager(); app.showToast("Manager access removed.");
  }
  function dialogContent() {
    const connected = configured();
    const email = session ? jwtPayload().email || "Approved user" : "Not signed in";
    const permissionSummary = !membership ? "Not signed in" : isOwner() ? "Owner · all areas" : ["Manager", can("payroll") && "Payroll", can("communications") && "Communication Log"].filter(Boolean).join(" · ");
    return `<div class="production-dialog-content">
      <span class="production-badge">${connected ? "Production connection saved" : "One-time setup"}</span>
      <h2>${connected ? "Account & secure sync" : "Connect the production pilot"}</h2>
      <p>${connected ? "This device is connected to the protected Store Operations database." : "Enter the public connection values from the one-time setup."}</p>
      ${connected ? `<div class="account-summary"><strong>${esc(email)}</strong><br><span>Store ${esc(config.storeId)} · ${esc(permissionSummary)}</span></div>` : `
      <form id="connection-form" class="fields connection-form">
        <label>Supabase project URL<input name="url" type="url" placeholder="https://your-project.supabase.co" required></label>
        <label>Public anon key<input name="key" type="password" autocomplete="off" required></label>
        <label>Store number<input name="store" value="${esc(config.storeId || "2102")}" required></label>
        <button type="submit" class="button primary">Save secure connection</button>
      </form>`}
      ${connected && isOwner() ? `<section class="manager-access-panel">
        <div><p class="eyebrow">Owner controls</p><h3>Manager access</h3><p>Add each manager by email and choose their sensitive-area access individually.</p></div>
        <form id="manager-access-form" class="fields">
          <label>Manager email<input name="email" type="email" autocomplete="email" required></label>
          <div class="permission-checks"><label><input name="payroll" type="checkbox"> Payroll</label><label><input name="communications" type="checkbox"> Communication Log</label></div>
          <button type="submit" class="button primary">Add or update manager</button>
        </form>
        <div id="manager-access-list" class="manager-access-list"><p>Loading manager access…</p></div>
      </section>` : ""}
      <div class="button-row">
        ${connected && session && isOwner() ? `<button type="button" class="button secondary" id="dialog-cloud-backup">Create cloud backup</button>` : ""}
        ${connected && session ? `<button type="button" class="button secondary" id="dialog-sign-out">Sign out</button>` : ""}
        ${connected ? `<button type="button" class="button secondary" id="forget-connection">Forget connection on this device</button>` : ""}
      </div>
    </div>`;
  }
  function openAccount() {
    const dialog = el("#production-dialog");
    el("#production-dialog-content").outerHTML = `<div id="production-dialog-content">${dialogContent()}</div>`;
    dialog.showModal();
    if (isOwner()) loadAccessManager();
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
      const remove = event.target.closest(".remove-manager-access");
      if (remove && confirm(`Remove dashboard access for ${remove.dataset.email}?`)) {
        try { await removeManagerAccess(remove.dataset.email); } catch (error) { app.showToast(error.message); }
      }
      if (event.target.id === "forget-connection" && confirm("Forget the production connection on this device? Your cloud data will not be deleted.")) {
        localStorage.removeItem(CONNECTION_KEY); localStorage.removeItem(SESSION_KEY); location.reload();
      }
    });
    el("#production-dialog").addEventListener("submit", async (event) => {
      if (event.target.id === "manager-access-form") {
        event.preventDefault();
        try { await saveManagerAccess(event.target); } catch (error) { app.showToast(error.message); }
        return;
      }
      if (event.target.id !== "connection-form") return;
      event.preventDefault();
      const form = new FormData(event.target);
      const next = { supabaseUrl: cleanUrl(form.get("url")), supabaseAnonKey: String(form.get("key") || "").trim(), storeId: String(form.get("store") || "2102").trim() };
      localStorage.setItem(CONNECTION_KEY, JSON.stringify(next)); location.reload();
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
        setSession(null); localStorage.removeItem(APP_STATE_KEY); showGate(error.message); return;
      }
      hideGate(); setStatus("offline", "Saved locally", "Secure sync will retry");
      setNote("sync-warning", "<strong>Secure sync is unavailable:</strong> the last protected copy remains on this device. You can continue working and changes will upload after the connection returns.");
    }
  }

  window.StoreOpsProduction = { init, queueSave, openAccount, exportBackup, createCloudBackup };
})();
