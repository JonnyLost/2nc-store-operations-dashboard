const STORAGE_KEY = "store-operations-demo-v1";

const defaultState = {
  operatingDate: "2026-07-30",
  store: {
    number: "DEMO",
    name: "Sample Store",
    gm: "Jordan Lee",
    weekStart: "Sunday",
  },
  associates: [
    { name: "Jordan Lee", id: "DEMO-01", role: "GM" },
    { name: "Casey Morgan", id: "DEMO-02", role: "ASM" },
    { name: "Taylor Reed", id: "DEMO-03", role: "MOD" },
    { name: "Alex Rivera", id: "DEMO-04", role: "Associate" },
    { name: "Cameron Ellis", id: "DEMO-05", role: "Associate" },
    { name: "Riley Parker", id: "DEMO-06", role: "Associate" },
  ],
  budgets: [
    { day: "Sunday", date: "2026-07-26", budget: 5125, lastYear: 4980 },
    { day: "Monday", date: "2026-07-27", budget: 3980, lastYear: 3760 },
    { day: "Tuesday", date: "2026-07-28", budget: 3650, lastYear: 3540 },
    { day: "Wednesday", date: "2026-07-29", budget: 4616, lastYear: 4385 },
    { day: "Thursday", date: "2026-07-30", budget: 4300, lastYear: 4110 },
    { day: "Friday", date: "2026-07-31", budget: 5980, lastYear: 5720 },
    { day: "Saturday", date: "2026-08-01", budget: 11650, lastYear: 10980 },
  ],
  goals: {
    loyalty: 15,
    buybackRatio: 1.1,
    bookDrive: 125,
    mysteryBoxes: 20,
    cft: 50,
    payrollHours: 290,
  },
  schedule: [
    { associate: "Jordan Lee", start: "08:00", end: "17:00", position: "MOD", break: "1:00", assignment: "Open / floor leadership" },
    { associate: "Casey Morgan", start: "09:00", end: "18:00", position: "Buy Counter", break: "1:30", assignment: "Buyback & training" },
    { associate: "Taylor Reed", start: "11:00", end: "20:00", position: "MOD", break: "3:00", assignment: "Closing MOD / recovery" },
    { associate: "Alex Rivera", start: "10:00", end: "18:30", position: "Books", break: "2:00", assignment: "Fiction reset / Book Drive" },
    { associate: "Cameron Ellis", start: "12:00", end: "20:00", position: "Media", break: "4:00", assignment: "Media go-backs / Mystery Box" },
    { associate: "Riley Parker", start: "16:00", end: "20:00", position: "Register", break: "—", assignment: "Loyalty / closing recovery" },
  ],
  priorities: [
    "Lead with loyalty at every register interaction",
    "Clear all buyback carts before the 5 PM handoff",
    "Complete Fiction reset and photograph final presentation",
  ],
  teamMessage: "Book Drive runs through Saturday. Ask every customer and celebrate every donation. Closing team: complete all recovery zones before final walk.",
  results: {
    sales: 4510,
    retailUnits: 280,
    shelvableUnits: 342,
    nonRetailUnits: 38,
    buybackDollars: 815,
    loyaltyOpps: 42,
    loyaltyEnroll: 7,
    scheduledHours: 49,
    workedHours: 48.5,
  },
  beforeToday: {
    sales: 17885,
    lastYearSales: 16665,
    retailUnits: 1120,
    shelvableUnits: 1230,
    loyaltyOpps: 240,
    loyaltyEnroll: 36,
    workedHours: 164.5,
  },
  contests: {
    bookDrive: 82,
    mysteryBoxes: 14,
    cft: 38,
  },
  nightly: {
    mod: "Taylor Reed",
    wins: "Finished above budget and loyalty goal. Strong buyback flow through the afternoon.",
    opportunities: "Recovery slipped during the 5–6 PM traffic peak.",
    followup: "Check the loose fixture in Young Adult tomorrow morning.",
    handoff: "Finish the Fiction reset and verify Saturday’s staffing.",
  },
};

const positions = ["MOD", "Register", "Buy Counter", "Books", "Media", "Comics", "Floor", "Projects"];
const roles = ["GM", "ASM", "MOD", "Associate"];
const pageNames = {
  today: ["Today", "Daily command center"],
  setup: ["Store setup", "One-time foundation"],
  goals: ["Budgets & goals", "Weekly plan"],
  schedule: ["Schedule", "People plan"],
  results: ["Daily results", "Live scorecard"],
  agenda: ["Print agenda", "Associate huddle sheet"],
  nightly: ["Nightly report", "Closing MOD workflow"],
};

let state = loadState();
let toastTimer;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...clone(defaultState), ...JSON.parse(saved) } : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function persist(message = "Saved. Dashboard and agenda updated.") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast(message);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function number(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);
}

function percent(value) {
  return `${number(value, 1)}%`;
}

function dateText(value, options = { month: "short", day: "numeric" }) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function timeText(value) {
  if (!value || value === "—") return "—";
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function initials(name) {
  return String(name).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function selected(value, match) {
  return value === match ? "selected" : "";
}

function currentDayIndex() {
  const index = state.budgets.findIndex((row) => row.date === state.operatingDate);
  return index >= 0 ? index : 4;
}

function currentBudget() {
  return state.budgets[currentDayIndex()] || state.budgets[4];
}

function wtdBudget() {
  return state.budgets.slice(0, currentDayIndex() + 1).reduce((sum, row) => sum + Number(row.budget || 0), 0);
}

function wtdLastYear() {
  return state.budgets.slice(0, currentDayIndex() + 1).reduce((sum, row) => sum + Number(row.lastYear || 0), 0);
}

function calculations() {
  const sales = Number(state.results.sales || 0);
  const wtdSales = Number(state.beforeToday.sales || 0) + sales;
  const budget = currentBudget();
  const salesVariance = sales - Number(budget.budget || 0);
  const wtdVariance = wtdSales - wtdBudget();
  const lyVariance = wtdSales - wtdLastYear();
  const retail = Number(state.beforeToday.retailUnits || 0) + Number(state.results.retailUnits || 0);
  const shelvable = Number(state.beforeToday.shelvableUnits || 0) + Number(state.results.shelvableUnits || 0);
  const buybackRatio = retail ? shelvable / retail : 0;
  const loyaltyOpps = Number(state.beforeToday.loyaltyOpps || 0) + Number(state.results.loyaltyOpps || 0);
  const loyaltyEnroll = Number(state.beforeToday.loyaltyEnroll || 0) + Number(state.results.loyaltyEnroll || 0);
  const loyalty = loyaltyOpps ? (loyaltyEnroll / loyaltyOpps) * 100 : 0;
  const workedHours = Number(state.beforeToday.workedHours || 0) + Number(state.results.workedHours || 0);
  return {
    sales,
    wtdSales,
    salesVariance,
    wtdVariance,
    lyVariance,
    buybackRatio,
    loyalty,
    workedHours,
    budget,
  };
}

function varianceClass(value) {
  return value >= 0 ? "positive" : "negative";
}

function varianceText(value) {
  return `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`;
}

function renderToday() {
  const calc = calculations();
  const metrics = [
    {
      label: "WTD sales",
      value: money(calc.wtdSales),
      meta: `${varianceText(calc.wtdVariance)} to budget`,
      detail: `${varianceText(calc.lyVariance)} to LY`,
      tone: varianceClass(calc.wtdVariance),
      highlight: true,
    },
    {
      label: "Buyback ratio",
      value: number(calc.buybackRatio, 3),
      meta: `Goal ${number(state.goals.buybackRatio, 3)}`,
      detail: calc.buybackRatio >= state.goals.buybackRatio ? "On goal" : "Below goal",
      tone: calc.buybackRatio >= state.goals.buybackRatio ? "positive" : "negative",
    },
    {
      label: "Loyalty",
      value: percent(calc.loyalty),
      meta: `Goal ${percent(state.goals.loyalty)}`,
      detail: `${Math.max(0, state.goals.loyalty - calc.loyalty).toFixed(1)} pts needed`,
      tone: calc.loyalty >= state.goals.loyalty ? "positive" : "negative",
    },
    {
      label: "Book Drive",
      value: number(state.contests.bookDrive),
      meta: `Goal ${number(state.goals.bookDrive)}`,
      detail: `${Math.max(0, state.goals.bookDrive - state.contests.bookDrive)} remaining`,
      tone: "neutral",
    },
    {
      label: "Payroll hours",
      value: number(calc.workedHours, 1),
      meta: `Budget ${number(state.goals.payrollHours, 1)}`,
      detail: `${number(state.goals.payrollHours - calc.workedHours, 1)} available`,
      tone: calc.workedHours <= state.goals.payrollHours ? "positive" : "negative",
    },
  ];
  document.querySelector("#today-metrics").innerHTML = metrics.map((item) => `
    <article class="metric-card ${item.highlight ? "highlight" : ""}">
      <p class="eyebrow">${esc(item.label)}</p>
      <h3>${esc(item.value)}</h3>
      <div class="metric-meta"><span class="${item.tone}">${esc(item.meta)}</span><span>${esc(item.detail)}</span></div>
    </article>
  `).join("");

  document.querySelector("#today-summary").textContent = calc.wtdVariance >= 0
    ? `The store is ${money(calc.wtdVariance)} above budget WTD. Keep loyalty and buyback moving.`
    : `The store needs ${money(Math.abs(calc.wtdVariance))} to recover the WTD budget. Focus on conversion and loyalty.`;

  document.querySelector("#today-schedule").innerHTML = state.schedule.map((shift) => `
    <tr>
      <td><div class="associate-name"><span class="avatar">${esc(initials(shift.associate))}</span>${esc(shift.associate)}</div></td>
      <td>${esc(timeText(shift.start))}–${esc(timeText(shift.end))}</td>
      <td><span class="position-tag">${esc(shift.position)}</span></td>
      <td>${esc(shift.break)}</td>
      <td>${esc(shift.assignment)}</td>
    </tr>
  `).join("");

  document.querySelector("#today-priorities").innerHTML = state.priorities.map((item, index) => `
    <div class="priority-item">
      <span class="priority-number">${index + 1}</span>
      <div><strong>${esc(item)}</strong><span>${index === 0 ? "Every associate · all day" : "Assigned during shift huddle"}</span></div>
    </div>
  `).join("");

  const contestItems = [
    ["Book Drive", state.contests.bookDrive, state.goals.bookDrive],
    ["Mystery Boxes", state.contests.mysteryBoxes, state.goals.mysteryBoxes],
    ["CFT", state.contests.cft, state.goals.cft],
  ];
  document.querySelector("#today-contests").innerHTML = contestItems.map(([name, result, goal]) => `
    <div class="contest-item">
      <div><strong>${esc(name)}</strong><span>${number(result)} of ${number(goal)}</span><div class="progress"><span style="width:${Math.min(100, (result / goal) * 100)}%"></span></div></div>
      <span class="contest-score">${percent((result / goal) * 100)}</span>
    </div>
  `).join("");
}

function renderSetup() {
  document.querySelector("#store-number").value = state.store.number;
  document.querySelector("#store-name").value = state.store.name;
  document.querySelector("#gm-name").value = state.store.gm;
  document.querySelector("#week-start").value = state.store.weekStart;
  document.querySelector("#associate-rows").innerHTML = state.associates.map((associate, index) => `
    <tr data-associate-index="${index}">
      <td><input class="inline-input associate-field" data-field="name" value="${esc(associate.name)}" aria-label="Associate name" /></td>
      <td><input class="inline-input associate-field" data-field="id" value="${esc(associate.id)}" aria-label="Employee ID" /></td>
      <td><select class="inline-input associate-field" data-field="role" aria-label="Role">${roles.map((role) => `<option ${selected(role, associate.role)}>${role}</option>`).join("")}</select></td>
      <td><button class="remove-button remove-associate" aria-label="Remove ${esc(associate.name)}">×</button></td>
    </tr>
  `).join("");
}

function renderGoals() {
  document.querySelector("#budget-rows").innerHTML = state.budgets.map((row, index) => `
    <tr data-budget-index="${index}">
      <td><strong>${esc(row.day)}</strong></td>
      <td><input class="inline-input budget-field" data-field="date" type="date" value="${esc(row.date)}" aria-label="${esc(row.day)} date" /></td>
      <td><input class="inline-input budget-field" data-field="budget" type="number" min="0" value="${row.budget}" aria-label="${esc(row.day)} budget" /></td>
      <td><input class="inline-input budget-field" data-field="lastYear" type="number" min="0" value="${row.lastYear}" aria-label="${esc(row.day)} last year" /></td>
    </tr>
  `).join("");
  updateBudgetTotalsFromInputs();

  const goals = [
    ["loyalty", "Loyalty goal (%)", "number", ".1"],
    ["buybackRatio", "Buyback ratio goal", "number", ".001"],
    ["bookDrive", "Book Drive goal", "number", "1"],
    ["mysteryBoxes", "Mystery Box goal", "number", "1"],
    ["cft", "CFT goal", "number", "1"],
    ["payrollHours", "Payroll hours budget", "number", ".25"],
  ];
  document.querySelector("#goal-fields").innerHTML = goals.map(([key, label, type, step]) => `
    <label>${label}<input class="goal-field" data-goal="${key}" type="${type}" step="${step}" min="0" value="${state.goals[key]}" /></label>
  `).join("");
}

function renderSchedule() {
  const associateOptions = state.associates.map((associate) => associate.name);
  document.querySelector("#shift-rows").innerHTML = state.schedule.map((shift, index) => `
    <div class="shift-row" data-shift-index="${index}">
      <label><span>Associate</span><select class="shift-field" data-field="associate">${associateOptions.map((name) => `<option ${selected(name, shift.associate)}>${esc(name)}</option>`).join("")}</select></label>
      <label><span>Start</span><input class="shift-field" data-field="start" type="time" value="${esc(shift.start)}" /></label>
      <label><span>End</span><input class="shift-field" data-field="end" type="time" value="${esc(shift.end)}" /></label>
      <label><span>Position</span><select class="shift-field" data-field="position">${positions.map((position) => `<option ${selected(position, shift.position)}>${position}</option>`).join("")}</select></label>
      <label><span>Break</span><input class="shift-field" data-field="break" value="${esc(shift.break)}" /></label>
      <label><span>Assignment</span><input class="shift-field" data-field="assignment" value="${esc(shift.assignment)}" /></label>
      <button class="remove-button remove-shift" aria-label="Remove shift">×</button>
    </div>
  `).join("");
  document.querySelector("#priority-fields").innerHTML = state.priorities.map((priority, index) => `
    <label>Priority ${index + 1}<input class="priority-field" data-priority-index="${index}" value="${esc(priority)}" /></label>
  `).join("");
  document.querySelector("#team-message").value = state.teamMessage;
}

function renderResults() {
  const fields = {
    "#result-sales": "sales",
    "#result-retail-units": "retailUnits",
    "#result-shelvable-units": "shelvableUnits",
    "#result-nonretail-units": "nonRetailUnits",
    "#result-buyback-dollars": "buybackDollars",
    "#result-loyalty-opps": "loyaltyOpps",
    "#result-loyalty-enroll": "loyaltyEnroll",
    "#result-scheduled-hours": "scheduledHours",
    "#result-worked-hours": "workedHours",
  };
  Object.entries(fields).forEach(([selector, key]) => {
    document.querySelector(selector).value = state.results[key];
  });
  updateResultCallouts();
}

function draftResults() {
  return {
    sales: Number(document.querySelector("#result-sales").value || 0),
    retailUnits: Number(document.querySelector("#result-retail-units").value || 0),
    shelvableUnits: Number(document.querySelector("#result-shelvable-units").value || 0),
    nonRetailUnits: Number(document.querySelector("#result-nonretail-units").value || 0),
    buybackDollars: Number(document.querySelector("#result-buyback-dollars").value || 0),
    loyaltyOpps: Number(document.querySelector("#result-loyalty-opps").value || 0),
    loyaltyEnroll: Number(document.querySelector("#result-loyalty-enroll").value || 0),
    scheduledHours: Number(document.querySelector("#result-scheduled-hours").value || 0),
    workedHours: Number(document.querySelector("#result-worked-hours").value || 0),
  };
}

function updateResultCallouts() {
  const result = draftResults();
  const budget = Number(currentBudget().budget || 0);
  const variance = result.sales - budget;
  const ratio = result.retailUnits ? result.shelvableUnits / result.retailUnits : 0;
  const loyalty = result.loyaltyOpps ? (result.loyaltyEnroll / result.loyaltyOpps) * 100 : 0;
  const hours = result.workedHours - result.scheduledHours;
  document.querySelector("#sales-callout").textContent = `${varianceText(variance)} ${variance >= 0 ? "above" : "below"} today’s budget of ${money(budget)}.`;
  document.querySelector("#buyback-callout").textContent = `Today’s ratio: ${number(ratio, 3)} · ${number(result.shelvableUnits)} shelvable from ${number(result.retailUnits)} retail units.`;
  document.querySelector("#loyalty-callout").textContent = `Today’s loyalty: ${percent(loyalty)} · ${number(result.loyaltyEnroll)} enrollments from ${number(result.loyaltyOpps)} opportunities.`;
  document.querySelector("#payroll-callout").textContent = `${number(Math.abs(hours), 1)} hours ${hours <= 0 ? "under" : "over"} today’s schedule.`;
}

function renderAgenda() {
  const calc = calculations();
  const date = new Date(`${state.operatingDate}T12:00:00`);
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  document.querySelector("#agenda-date").textContent = `${dayName}\n${dateText(state.operatingDate, { month: "long", day: "numeric", year: "numeric" })}`;
  const agendaMetrics = [
    ["Today’s budget", money(calc.budget.budget)],
    ["WTD sales", money(calc.wtdSales)],
    ["To budget", varianceText(calc.wtdVariance)],
    ["Loyalty", percent(calc.loyalty)],
    ["Buyback ratio", number(calc.buybackRatio, 3)],
  ];
  document.querySelector("#agenda-metrics").innerHTML = agendaMetrics.map(([label, value]) => `
    <div class="agenda-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>
  `).join("");
  document.querySelector("#agenda-schedule").innerHTML = state.schedule.map((shift) => `
    <tr><td><strong>${esc(shift.associate)}</strong></td><td>${esc(timeText(shift.start))}–${esc(timeText(shift.end))}</td><td>${esc(shift.position)}</td><td>${esc(shift.break)}</td><td>${esc(shift.assignment)}</td></tr>
  `).join("");
  document.querySelector("#agenda-priorities").innerHTML = state.priorities.map((priority) => `<li>${esc(priority)}</li>`).join("");
  const contests = [
    ["Book Drive", `${state.contests.bookDrive} / ${state.goals.bookDrive}`],
    ["Mystery Boxes", `${state.contests.mysteryBoxes} / ${state.goals.mysteryBoxes}`],
    ["CFT", `${state.contests.cft} / ${state.goals.cft}`],
  ];
  document.querySelector("#agenda-contests").innerHTML = contests.map(([label, value]) => `
    <div class="agenda-contest-line"><strong>${esc(label)}</strong><span>${esc(value)}</span></div>
  `).join("");
  document.querySelector("#agenda-message").textContent = state.teamMessage;
}

function renderNightly() {
  const managerNames = state.associates.filter((associate) => ["GM", "ASM", "MOD"].includes(associate.role)).map((associate) => associate.name);
  document.querySelector("#nightly-mod").innerHTML = managerNames.map((name) => `<option ${selected(name, state.nightly.mod)}>${esc(name)}</option>`).join("");
  document.querySelector("#nightly-wins").value = state.nightly.wins;
  document.querySelector("#nightly-opportunities").value = state.nightly.opportunities;
  document.querySelector("#nightly-followup").value = state.nightly.followup;
  document.querySelector("#nightly-handoff").value = state.nightly.handoff;
}

function renderAll() {
  document.querySelector("#operating-date").value = state.operatingDate;
  renderToday();
  renderSetup();
  renderGoals();
  renderSchedule();
  renderResults();
  renderAgenda();
  renderNightly();
}

function updateBudgetTotalsFromInputs() {
  const rows = [...document.querySelectorAll("[data-budget-index]")];
  const budgetTotal = rows.reduce((sum, row) => sum + Number(row.querySelector('[data-field="budget"]').value || 0), 0);
  const lyTotal = rows.reduce((sum, row) => sum + Number(row.querySelector('[data-field="lastYear"]').value || 0), 0);
  document.querySelector("#budget-total").textContent = money(budgetTotal);
  document.querySelector("#ly-total").textContent = money(lyTotal);
}

function goTo(page) {
  document.querySelectorAll("[data-page-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === page));
  document.querySelectorAll(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  document.querySelector("#page-title").textContent = pageNames[page][0];
  document.querySelector("#page-eyebrow").textContent = pageNames[page][1];
  document.body.classList.remove("nav-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveSetup() {
  state.store = {
    number: document.querySelector("#store-number").value.trim(),
    name: document.querySelector("#store-name").value.trim(),
    gm: document.querySelector("#gm-name").value.trim(),
    weekStart: document.querySelector("#week-start").value,
  };
  state.associates = [...document.querySelectorAll("[data-associate-index]")].map((row) => ({
    name: row.querySelector('[data-field="name"]').value.trim(),
    id: row.querySelector('[data-field="id"]').value.trim(),
    role: row.querySelector('[data-field="role"]').value,
  })).filter((associate) => associate.name);
  persist("Store setup saved.");
  renderAll();
}

function saveGoals() {
  state.budgets = [...document.querySelectorAll("[data-budget-index]")].map((row, index) => ({
    day: state.budgets[index].day,
    date: row.querySelector('[data-field="date"]').value,
    budget: Number(row.querySelector('[data-field="budget"]').value || 0),
    lastYear: Number(row.querySelector('[data-field="lastYear"]').value || 0),
  }));
  document.querySelectorAll(".goal-field").forEach((input) => {
    state.goals[input.dataset.goal] = Number(input.value || 0);
  });
  persist("Budgets and goals saved.");
  renderAll();
}

function saveSchedule() {
  state.schedule = [...document.querySelectorAll("[data-shift-index]")].map((row) => ({
    associate: row.querySelector('[data-field="associate"]').value,
    start: row.querySelector('[data-field="start"]').value,
    end: row.querySelector('[data-field="end"]').value,
    position: row.querySelector('[data-field="position"]').value,
    break: row.querySelector('[data-field="break"]').value.trim(),
    assignment: row.querySelector('[data-field="assignment"]').value.trim(),
  }));
  state.priorities = [...document.querySelectorAll(".priority-field")].map((input) => input.value.trim()).filter(Boolean);
  state.teamMessage = document.querySelector("#team-message").value.trim();
  persist("Schedule and assignments saved.");
  renderAll();
}

function saveResults() {
  state.results = draftResults();
  persist("Daily results saved.");
  renderAll();
}

function generateNightlyReport() {
  state.nightly = {
    mod: document.querySelector("#nightly-mod").value,
    wins: document.querySelector("#nightly-wins").value.trim(),
    opportunities: document.querySelector("#nightly-opportunities").value.trim(),
    followup: document.querySelector("#nightly-followup").value.trim(),
    handoff: document.querySelector("#nightly-handoff").value.trim(),
  };
  const calc = calculations();
  const report = [
    `STORE ${state.store.number} ${state.store.name.toUpperCase()} — NIGHTLY REPORT`,
    `${dateText(state.operatingDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Closing MOD: ${state.nightly.mod}`,
    "",
    "PERFORMANCE",
    `Sales: ${money(calc.sales)} (${varianceText(calc.salesVariance)} to budget)`,
    `WTD Sales: ${money(calc.wtdSales)} (${varianceText(calc.wtdVariance)} to budget; ${varianceText(calc.lyVariance)} to LY)`,
    `Loyalty: ${percent(calc.loyalty)} (goal ${percent(state.goals.loyalty)})`,
    `Buyback Ratio: ${number(calc.buybackRatio, 3)} (goal ${number(state.goals.buybackRatio, 3)})`,
    `Payroll: ${number(state.results.workedHours, 1)} worked / ${number(state.results.scheduledHours, 1)} scheduled hours today`,
    "",
    "WINS / CELEBRATIONS",
    state.nightly.wins || "None noted.",
    "",
    "OPPORTUNITIES / MISSES",
    state.nightly.opportunities || "None noted.",
    "",
    "FOLLOW-UP",
    state.nightly.followup || "None noted.",
    "",
    "TOMORROW’S HANDOFF",
    state.nightly.handoff || "None noted.",
  ].join("\n");
  document.querySelector("#report-preview").textContent = report;
  persist("Nightly report generated and saved.");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]");
  const go = event.target.closest("[data-go]");
  if (nav) goTo(nav.dataset.page);
  if (go) goTo(go.dataset.go);

  if (event.target.closest("#menu-button")) document.body.classList.toggle("nav-open");
  if (event.target.closest("#save-setup")) saveSetup();
  if (event.target.closest("#save-goals")) saveGoals();
  if (event.target.closest("#save-schedule")) saveSchedule();
  if (event.target.closest("#save-results")) saveResults();
  if (event.target.closest("#generate-report")) generateNightlyReport();
  if (event.target.closest("#print-agenda")) window.print();

  if (event.target.closest("#add-associate")) {
    state.associates.push({ name: "New associate", id: "", role: "Associate" });
    renderSetup();
  }
  const removeAssociate = event.target.closest(".remove-associate");
  if (removeAssociate) {
    const row = removeAssociate.closest("[data-associate-index]");
    state.associates.splice(Number(row.dataset.associateIndex), 1);
    renderSetup();
  }
  if (event.target.closest("#add-shift")) {
    state.schedule.push({
      associate: state.associates[0]?.name || "Associate",
      start: "09:00",
      end: "17:00",
      position: "Floor",
      break: "1:00",
      assignment: "",
    });
    renderSchedule();
  }
  const removeShift = event.target.closest(".remove-shift");
  if (removeShift) {
    const row = removeShift.closest("[data-shift-index]");
    state.schedule.splice(Number(row.dataset.shiftIndex), 1);
    renderSchedule();
  }
  if (event.target.closest("#copy-report")) {
    navigator.clipboard.writeText(document.querySelector("#report-preview").textContent)
      .then(() => showToast("Nightly report copied."))
      .catch(() => showToast("Copy was blocked. Select the report text to copy it."));
  }
  if (event.target.closest("#reset-demo")) {
    const confirmed = window.confirm("Reset all prototype entries on this device to the original sample data?");
    if (confirmed) {
      state = clone(defaultState);
      localStorage.removeItem(STORAGE_KEY);
      renderAll();
      goTo("today");
      showToast("Prototype reset.");
    }
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".budget-field")) updateBudgetTotalsFromInputs();
  if (event.target.closest("#page-results")) updateResultCallouts();
});

document.querySelector("#operating-date").addEventListener("change", (event) => {
  state.operatingDate = event.target.value;
  persist("Operating date updated.");
  renderAll();
});

renderAll();
