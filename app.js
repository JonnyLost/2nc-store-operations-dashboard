const STORAGE_KEY = "store-operations-demo-v2";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

const demoShifts = [
  { associate: "Jordan Lee", start: "08:00", end: "17:00", position: "MOD", breakMinutes: 60, breakAt: "1:00", assignment: "Open / floor leadership" },
  { associate: "Casey Morgan", start: "09:00", end: "18:00", position: "Buy Counter", breakMinutes: 30, breakAt: "1:30", assignment: "Buyback & training" },
  { associate: "Taylor Reed", start: "11:00", end: "20:00", position: "MOD", breakMinutes: 60, breakAt: "3:00", assignment: "Closing MOD / recovery" },
  { associate: "Alex Rivera", start: "10:00", end: "18:30", position: "Books", breakMinutes: 30, breakAt: "2:00", assignment: "Fiction reset / Book Drive" },
  { associate: "Cameron Ellis", start: "12:00", end: "20:00", position: "Media", breakMinutes: 30, breakAt: "4:00", assignment: "Media go-backs / Mystery Box" },
  { associate: "Riley Parker", start: "16:00", end: "20:00", position: "Register", breakMinutes: 0, breakAt: "—", assignment: "Loyalty / closing recovery" },
];

const defaultState = {
  operatingDate: "2026-07-30",
  selectedScheduleDay: 4,
  store: { number: "DEMO", name: "Sample Store", gm: "Jordan Lee", weekStart: "Sunday" },
  associates: [
    { name: "Jordan Lee", id: "DEMO-01", role: "GM", payRate: 24.5 },
    { name: "Casey Morgan", id: "DEMO-02", role: "ASM", payRate: 20.25 },
    { name: "Taylor Reed", id: "DEMO-03", role: "MOD", payRate: 17.75 },
    { name: "Alex Rivera", id: "DEMO-04", role: "Associate", payRate: 14.25 },
    { name: "Cameron Ellis", id: "DEMO-05", role: "Associate", payRate: 14.75 },
    { name: "Riley Parker", id: "DEMO-06", role: "Associate", payRate: 13.75 },
    { name: "Morgan Stone", id: "DEMO-07", role: "Associate", payRate: 14.5 },
    { name: "Jamie Quinn", id: "DEMO-08", role: "Associate", payRate: 13.5 },
  ],
  budgets: [
    { day: "Sunday", date: "2026-07-26", budget: 5125, lastYear: 4980, buybackGoal: 360, lyBuybackUnits: 338, lyBuybackRatio: 1.084, payrollBudget: 970 },
    { day: "Monday", date: "2026-07-27", budget: 3980, lastYear: 3760, buybackGoal: 285, lyBuybackUnits: 271, lyBuybackRatio: 1.102, payrollBudget: 810 },
    { day: "Tuesday", date: "2026-07-28", budget: 3650, lastYear: 3540, buybackGoal: 270, lyBuybackUnits: 259, lyBuybackRatio: 1.093, payrollBudget: 785 },
    { day: "Wednesday", date: "2026-07-29", budget: 4616, lastYear: 4385, buybackGoal: 330, lyBuybackUnits: 312, lyBuybackRatio: 1.118, payrollBudget: 900 },
    { day: "Thursday", date: "2026-07-30", budget: 4300, lastYear: 4110, buybackGoal: 320, lyBuybackUnits: 302, lyBuybackRatio: 1.121, payrollBudget: 890 },
    { day: "Friday", date: "2026-07-31", budget: 5980, lastYear: 5720, buybackGoal: 440, lyBuybackUnits: 416, lyBuybackRatio: 1.134, payrollBudget: 1085 },
    { day: "Saturday", date: "2026-08-01", budget: 11650, lastYear: 10980, buybackGoal: 720, lyBuybackUnits: 688, lyBuybackRatio: 1.146, payrollBudget: 1490 },
  ],
  goals: { loyalty: 15, buybackRatio: 1.1 },
  weeklySchedule: days.map((_, index) => {
    const schedule = structuredClone(index === 4 ? demoShifts : demoShifts.slice(0, index === 0 ? 4 : index === 6 ? 6 : 5));
    const replacements = {
      0: { "Jordan Lee": "Morgan Stone", "Casey Morgan": "Jamie Quinn" },
      1: { "Taylor Reed": "Morgan Stone" },
      2: { "Casey Morgan": "Morgan Stone", "Alex Rivera": "Jamie Quinn" },
      3: { "Jordan Lee": "Morgan Stone", "Cameron Ellis": "Jamie Quinn" },
      5: { "Casey Morgan": "Jamie Quinn" },
      6: { "Taylor Reed": "Morgan Stone", "Alex Rivera": "Jamie Quinn" },
    };
    return schedule.map((shift) => ({ ...shift, associate: replacements[index]?.[shift.associate] || shift.associate }));
  }),
  priorities: [
    "Lead with loyalty at every register interaction",
    "Clear all buyback carts before the 5 PM handoff",
    "Complete Fiction reset and photograph final presentation",
  ],
  teamMessage: "Book Drive runs through Saturday. Ask every customer and celebrate every donation. Closing team: complete all recovery zones before final walk.",
  results: {
    sales: 4510, retailUnits: 280, shelvableUnits: 342, nonRetailUnits: 38, buybackDollars: 815,
    newSignups: 7, blankTransactions: 42, totalTransactions: 238,
    actualHours: { "Jordan Lee": 8, "Casey Morgan": 8.25, "Taylor Reed": 8, "Alex Rivera": 7.75, "Cameron Ellis": 7.25, "Riley Parker": 4 },
  },
  beforeToday: {
    sales: 17885, lastYearSales: 16665, retailUnits: 1120, shelvableUnits: 1230,
    newSignups: 36, blankTransactions: 240, totalTransactions: 1410, payrollCost: 3125,
  },
  contestsEnabled: true,
  contests: [
    {
      id: "bookDrive", name: "Book Drive", active: true, metric: "dollars", goal: 125,
      result: 82, units: 49, transactions: 31,
      associateResults: { "Jordan Lee": 15, "Casey Morgan": 18, "Taylor Reed": 14, "Alex Rivera": 21, "Cameron Ellis": 8, "Riley Parker": 6 },
    },
    {
      id: "coffeeTroops", name: "Coffee for the Troops", active: true, metric: "units", goal: 50,
      result: 38, units: 38, transactions: 0,
      associateResults: { "Jordan Lee": 8, "Casey Morgan": 7, "Taylor Reed": 6, "Alex Rivera": 7, "Cameron Ellis": 6, "Riley Parker": 4 },
    },
    {
      id: "mysteryBoxes", name: "Mystery Boxes", active: false, metric: "units", goal: 20,
      result: 14, units: 14, transactions: 0, associateResults: {},
    },
  ],
  nightly: {
    mod: "Taylor Reed",
    wins: "Finished above budget and loyalty goal. Strong buyback flow through the afternoon.",
    opportunities: "Recovery slipped during the 5–6 PM traffic peak.",
    followup: "Check the loose fixture in Young Adult tomorrow morning.",
    handoff: "Finish the Fiction reset and verify Saturday’s staffing.",
  },
};

let state = loadState();
let toastTimer;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function esc(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function money(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(value) || 0);
}
function number(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(value) || 0);
}
function percent(value) { return Number.isFinite(Number(value)) ? `${number(value, 1)}%` : "—"; }
function ratio(value) { return Number.isFinite(Number(value)) ? number(value, 3) : "—"; }
function dateText(value, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(`${value}T12:00:00`));
}
function timeText(value) {
  if (!value || value === "—") return "—";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}
function initials(name) { return String(name).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
function selected(value, match) { return value === match ? "selected" : ""; }
function checked(value) { return value ? "checked" : ""; }
function safeDivide(a, b) { return Number(b) ? Number(a) / Number(b) : NaN; }
function varianceClass(value) { return value >= 0 ? "positive" : "negative"; }
function varianceText(value) { return `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`; }

function migrate(saved) {
  const merged = { ...clone(defaultState), ...saved };
  merged.associates = (saved.associates || defaultState.associates).map((a, i) => ({ ...a, payRate: Number(a.payRate ?? defaultState.associates[i]?.payRate ?? 14) }));
  merged.weeklySchedule = saved.weeklySchedule || days.map((_, i) => i === 4 ? clone(saved.schedule || demoShifts) : clone(defaultState.weeklySchedule[i]));
  merged.results = { ...clone(defaultState.results), ...(saved.results || {}) };
  merged.contests = saved.contests || clone(defaultState.contests);
  return merged;
}
function loadState() {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? migrate(JSON.parse(saved)) : clone(defaultState); }
  catch { return clone(defaultState); }
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

function currentDayIndex() {
  const index = state.budgets.findIndex((row) => row.date === state.operatingDate);
  return index >= 0 ? index : state.selectedScheduleDay;
}
function currentBudget() { return state.budgets[currentDayIndex()] || state.budgets[4]; }
function currentSchedule() { return state.weeklySchedule[currentDayIndex()] || []; }
function activeContests() { return state.contestsEnabled ? state.contests.filter((c) => c.active) : []; }
function associateByName(name) { return state.associates.find((associate) => associate.name === name); }
function parseMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function shiftHours(shift) {
  let minutes = parseMinutes(shift.end) - parseMinutes(shift.start);
  if (minutes < 0) minutes += 1440;
  return Math.max(0, (minutes - Number(shift.breakMinutes || 0)) / 60);
}
function shiftCost(shift) { return shiftHours(shift) * Number(associateByName(shift.associate)?.payRate || 0); }
function dayScheduledHours(index) { return (state.weeklySchedule[index] || []).reduce((sum, shift) => sum + shiftHours(shift), 0); }
function dayScheduledCost(index) { return (state.weeklySchedule[index] || []).reduce((sum, shift) => sum + shiftCost(shift), 0); }
function actualHoursTotal() { return Object.values(state.results.actualHours || {}).reduce((sum, value) => sum + Number(value || 0), 0); }
function actualCostTotal() {
  return Object.entries(state.results.actualHours || {}).reduce((sum, [name, hours]) => sum + Number(hours || 0) * Number(associateByName(name)?.payRate || 0), 0);
}

function calculations() {
  const index = currentDayIndex();
  const sales = Number(state.results.sales || 0);
  const wtdSales = Number(state.beforeToday.sales || 0) + sales;
  const wtdBudget = state.budgets.slice(0, index + 1).reduce((sum, row) => sum + Number(row.budget || 0), 0);
  const wtdLastYear = state.budgets.slice(0, index + 1).reduce((sum, row) => sum + Number(row.lastYear || 0), 0);
  const retail = Number(state.beforeToday.retailUnits || 0) + Number(state.results.retailUnits || 0);
  const shelvable = Number(state.beforeToday.shelvableUnits || 0) + Number(state.results.shelvableUnits || 0);
  const newSignups = Number(state.beforeToday.newSignups || 0) + Number(state.results.newSignups || 0);
  const blankTransactions = Number(state.beforeToday.blankTransactions || 0) + Number(state.results.blankTransactions || 0);
  const totalTransactions = Number(state.beforeToday.totalTransactions || 0) + Number(state.results.totalTransactions || 0);
  const namedTransactions = Math.max(0, totalTransactions - blankTransactions);
  const scheduledHours = dayScheduledHours(index);
  const scheduledCost = dayScheduledCost(index);
  const actualHours = actualHoursTotal();
  const actualCost = actualCostTotal();
  return {
    sales, wtdSales, salesVariance: sales - Number(currentBudget().budget || 0), wtdVariance: wtdSales - wtdBudget,
    lyVariance: wtdSales - wtdLastYear, buybackRatio: safeDivide(shelvable, retail),
    opportunityLoyalty: safeDivide(newSignups, blankTransactions) * 100,
    transactionLoyalty: safeDivide(namedTransactions, totalTransactions) * 100,
    scheduledHours, scheduledCost, actualHours, actualCost, budget: currentBudget(),
  };
}

function formatContestResult(contest, value = contest.result) {
  return contest.metric === "dollars" ? money(value) : `${number(value)} units`;
}

function renderToday() {
  const calc = calculations();
  const contests = activeContests();
  const metrics = [
    { label: "WTD sales", value: money(calc.wtdSales), meta: `${varianceText(calc.wtdVariance)} to budget`, detail: `${varianceText(calc.lyVariance)} to LY`, tone: varianceClass(calc.wtdVariance), highlight: true },
    { label: "Buyback ratio", value: ratio(calc.buybackRatio), meta: `Goal ${ratio(state.goals.buybackRatio)}`, detail: Number.isFinite(calc.buybackRatio) && calc.buybackRatio >= state.goals.buybackRatio ? "On goal" : "Below goal", tone: Number.isFinite(calc.buybackRatio) && calc.buybackRatio >= state.goals.buybackRatio ? "positive" : "negative" },
    { label: "Opportunity loyalty", value: percent(calc.opportunityLoyalty), meta: `Goal ${percent(state.goals.loyalty)}`, detail: "Sign-ups ÷ blanks", tone: calc.opportunityLoyalty >= state.goals.loyalty ? "positive" : "negative" },
    { label: "Payroll cost", value: money(calc.actualCost), meta: `Budget ${money(calc.budget.payrollBudget)}`, detail: `${money(Math.abs(calc.budget.payrollBudget - calc.actualCost))} ${calc.actualCost <= calc.budget.payrollBudget ? "available" : "over"}`, tone: calc.actualCost <= calc.budget.payrollBudget ? "positive" : "negative" },
    ...contests.slice(0, 2).map((contest) => ({ label: contest.name, value: formatContestResult(contest), meta: `Goal ${formatContestResult(contest, contest.goal)}`, detail: `${percent(safeDivide(contest.result, contest.goal) * 100)} complete`, tone: "neutral" })),
  ];
  document.querySelector("#today-metrics").style.setProperty("--metric-count", Math.min(metrics.length, 6));
  document.querySelector("#today-metrics").innerHTML = metrics.map((item) => `
    <article class="metric-card ${item.highlight ? "highlight" : ""}">
      <p class="eyebrow">${esc(item.label)}</p><h3>${esc(item.value)}</h3>
      <div class="metric-meta"><span class="${item.tone}">${esc(item.meta)}</span><span>${esc(item.detail)}</span></div>
    </article>`).join("");
  document.querySelector("#today-summary").textContent = calc.wtdVariance >= 0
    ? `The store is ${money(calc.wtdVariance)} above budget WTD. Keep loyalty and buyback moving.`
    : `The store needs ${money(Math.abs(calc.wtdVariance))} to recover the WTD budget. Focus on conversion and loyalty.`;
  document.querySelector("#today-schedule").innerHTML = currentSchedule().map((shift) => `
    <tr><td><div class="associate-name"><span class="avatar">${esc(initials(shift.associate))}</span>${esc(shift.associate)}</div></td>
    <td>${esc(timeText(shift.start))}–${esc(timeText(shift.end))}</td><td><strong class="position-text">${esc(shift.position)}</strong></td>
    <td>${esc(shift.breakAt || "—")}</td><td>${esc(shift.assignment)}</td></tr>`).join("");
  document.querySelector("#today-priorities").innerHTML = state.priorities.map((item, index) => `
    <div class="priority-item"><span class="priority-number">${index + 1}</span><div><strong>${esc(item)}</strong><span>${index === 0 ? "Every associate · all day" : "Assigned during shift huddle"}</span></div></div>`).join("");
  const container = document.querySelector("#today-contests");
  const panel = container.closest(".panel");
  panel.hidden = contests.length === 0;
  container.innerHTML = contests.map((contest) => `
    <div class="contest-item"><div><strong>${esc(contest.name)}</strong><span>${esc(formatContestResult(contest))} of ${esc(formatContestResult(contest, contest.goal))}</span>
    <div class="progress"><span style="width:${Math.min(100, safeDivide(contest.result, contest.goal) * 100 || 0)}%"></span></div></div>
    <span class="contest-score">${percent(safeDivide(contest.result, contest.goal) * 100)}</span></div>`).join("");
}

function renderSetup() {
  document.querySelector("#store-number").value = state.store.number;
  document.querySelector("#store-name").value = state.store.name;
  document.querySelector("#gm-name").value = state.store.gm;
  document.querySelector("#week-start").value = state.store.weekStart;
  document.querySelector("#associate-rows").innerHTML = state.associates.map((associate, index) => `
    <tr data-associate-index="${index}">
      <td><input class="inline-input associate-field" data-field="name" value="${esc(associate.name)}" aria-label="Associate name"></td>
      <td><input class="inline-input associate-field" data-field="id" value="${esc(associate.id)}" aria-label="Employee ID"></td>
      <td><select class="inline-input associate-field" data-field="role" aria-label="Role">${roles.map((role) => `<option ${selected(role, associate.role)}>${role}</option>`).join("")}</select></td>
      <td><input class="inline-input associate-field pay-rate-input" data-field="payRate" type="number" step=".01" min="0" value="${associate.payRate}" aria-label="Hourly pay rate"></td>
      <td><button class="remove-button remove-associate" aria-label="Remove ${esc(associate.name)}">×</button></td>
    </tr>`).join("");
  document.querySelector("#contests-enabled").checked = state.contestsEnabled;
  document.querySelector("#contest-setup-rows").innerHTML = state.contests.map((contest, index) => `
    <div class="contest-setup-row" data-contest-index="${index}">
      <label class="toggle compact"><input class="contest-field" data-field="active" type="checkbox" ${checked(contest.active)}><span></span> Active</label>
      <label>Contest name<input class="contest-field" data-field="name" value="${esc(contest.name)}"></label>
      <label>Primary measure<select class="contest-field" data-field="metric"><option value="dollars" ${selected("dollars", contest.metric)}>Dollars</option><option value="units" ${selected("units", contest.metric)}>Units</option></select></label>
      <label>Goal<input class="contest-field" data-field="goal" type="number" min="0" step=".01" value="${contest.goal}"></label>
    </div>`).join("");
  document.querySelector("#contest-setup-rows").classList.toggle("disabled-section", !state.contestsEnabled);
}

function renderGoals() {
  document.querySelector("#budget-rows").innerHTML = state.budgets.map((row, index) => `
    <tr data-budget-index="${index}"><td><strong>${esc(row.day)}</strong></td>
      <td><input class="inline-input budget-field" data-field="date" type="date" value="${row.date}"></td>
      <td><input class="inline-input budget-field" data-field="budget" type="number" min="0" value="${row.budget}"></td>
      <td><input class="inline-input budget-field" data-field="lastYear" type="number" min="0" value="${row.lastYear}"></td>
      <td><input class="inline-input budget-field" data-field="buybackGoal" type="number" min="0" value="${row.buybackGoal}"></td>
      <td><input class="inline-input budget-field" data-field="lyBuybackUnits" type="number" min="0" value="${row.lyBuybackUnits}"></td>
      <td><input class="inline-input budget-field" data-field="lyBuybackRatio" type="number" min="0" step=".001" value="${row.lyBuybackRatio}"></td>
      <td><input class="inline-input budget-field" data-field="payrollBudget" type="number" min="0" step=".01" value="${row.payrollBudget}"></td>
    </tr>`).join("");
  updateBudgetTotalsFromInputs();
  document.querySelector("#goal-fields").innerHTML = `
    <label>Loyalty goal (%)<input class="goal-field" data-goal="loyalty" type="number" step=".1" min="0" value="${state.goals.loyalty}"></label>
    <label>Buyback ratio goal<input class="goal-field" data-goal="buybackRatio" type="number" step=".001" min="0" value="${state.goals.buybackRatio}"></label>`;
}

function renderWeekOverview() {
  document.querySelector("#week-tabs").innerHTML = state.budgets.map((row, index) => `
    <button type="button" role="tab" class="week-tab ${index === state.selectedScheduleDay ? "active" : ""}" data-schedule-day="${index}">
      <span>${row.day.slice(0, 3)}</span><strong>${dateText(row.date)}</strong></button>`).join("");
  document.querySelector("#weekly-overview-head").innerHTML = `<tr><th>Associate</th>${state.budgets.map((row) => `<th>${row.day.slice(0, 3)}<br><span>${dateText(row.date)}</span></th>`).join("")}<th>Week</th></tr>`;
  document.querySelector("#weekly-overview-body").innerHTML = state.associates.map((associate) => {
    let total = 0;
    const cells = state.weeklySchedule.map((schedule) => {
      const shifts = schedule.filter((shift) => shift.associate === associate.name);
      const hours = shifts.reduce((sum, shift) => sum + shiftHours(shift), 0);
      total += hours;
      return `<td>${shifts.length ? shifts.map((shift) => `<span>${timeText(shift.start).replace(":00", "")}–${timeText(shift.end).replace(":00", "")}</span>`).join("") : "—"}</td>`;
    }).join("");
    return `<tr><td><strong>${esc(associate.name)}</strong><small>${esc(associate.role)}</small></td>${cells}<td><strong class="${total > 40 ? "negative" : ""}">${number(total, 1)}h</strong></td></tr>`;
  }).join("");
  const weeklyHours = state.weeklySchedule.reduce((sum, _, i) => sum + dayScheduledHours(i), 0);
  const weeklyCost = state.weeklySchedule.reduce((sum, _, i) => sum + dayScheduledCost(i), 0);
  const weeklyBudget = state.budgets.reduce((sum, row) => sum + Number(row.payrollBudget || 0), 0);
  document.querySelector("#weekly-overview-foot").innerHTML = `<tr><th>Daily cost</th>${state.budgets.map((_, i) => `<th>${money(dayScheduledCost(i))}</th>`).join("")}<th>${money(weeklyCost)}</th></tr>`;
  document.querySelector("#weekly-payroll-summary").innerHTML = `<span>${number(weeklyHours, 1)} scheduled hours</span><strong>${money(weeklyCost)} / ${money(weeklyBudget)}</strong><small class="${weeklyCost <= weeklyBudget ? "positive" : "negative"}">${money(Math.abs(weeklyBudget - weeklyCost))} ${weeklyCost <= weeklyBudget ? "available" : "over budget"}</small>`;
}

function renderSchedule() {
  renderWeekOverview();
  const dayIndex = state.selectedScheduleDay;
  const schedule = state.weeklySchedule[dayIndex] || [];
  document.querySelector("#schedule-day-label").textContent = `${state.budgets[dayIndex].day} · ${dateText(state.budgets[dayIndex].date, { month: "long", day: "numeric" })}`;
  document.querySelector("#shift-rows").innerHTML = schedule.map((shift, index) => `
    <div class="shift-row" data-shift-index="${index}">
      <label><span>Associate</span><select class="shift-field" data-field="associate">${state.associates.map((a) => `<option ${selected(a.name, shift.associate)}>${esc(a.name)}</option>`).join("")}</select></label>
      <label><span>Start</span><input class="shift-field" data-field="start" type="time" value="${shift.start}"></label>
      <label><span>End</span><input class="shift-field" data-field="end" type="time" value="${shift.end}"></label>
      <label><span>Position</span><select class="shift-field" data-field="position">${positions.map((p) => `<option ${selected(p, shift.position)}>${p}</option>`).join("")}</select></label>
      <label><span>Break</span><div class="break-fields"><input class="shift-field" data-field="breakAt" value="${esc(shift.breakAt || "—")}" aria-label="Break time"><input class="shift-field" data-field="breakMinutes" type="number" min="0" step="15" value="${shift.breakMinutes || 0}" aria-label="Unpaid break minutes"></div></label>
      <label><span>Assignment</span><input class="shift-field" data-field="assignment" value="${esc(shift.assignment)}"></label>
      <output>${number(shiftHours(shift), 2)}h</output><output>${money(shiftCost(shift), 2)}</output>
      <div class="shift-actions"><button class="icon-button duplicate-shift" aria-label="Duplicate shift">⧉</button><button class="remove-button remove-shift" aria-label="Remove shift">×</button></div>
    </div>`).join("");
  document.querySelector("#priority-fields").innerHTML = state.priorities.map((priority, index) => `<label>Priority ${index + 1}<input class="priority-field" value="${esc(priority)}"></label>`).join("");
  document.querySelector("#team-message").value = state.teamMessage;
  renderScheduleWarnings();
}

function renderScheduleWarnings() {
  const schedule = state.weeklySchedule[state.selectedScheduleDay] || [];
  const warnings = [];
  const managerCoverage = schedule.some((shift) => ["GM", "ASM", "MOD"].includes(associateByName(shift.associate)?.role));
  if (!managerCoverage) warnings.push("No MOD coverage");
  const registerCoverage = schedule.some((shift) => shift.position === "Register");
  if (!registerCoverage) warnings.push("No register assigned");
  state.associates.forEach((associate) => {
    const weekHours = state.weeklySchedule.flat().filter((s) => s.associate === associate.name).reduce((sum, shift) => sum + shiftHours(shift), 0);
    if (weekHours > 40) warnings.push(`${associate.name}: ${number(weekHours, 1)}h overtime`);
  });
  document.querySelector("#schedule-warnings").innerHTML = warnings.length
    ? warnings.map((warning) => `<span>⚠ ${esc(warning)}</span>`).join("")
    : `<span class="positive">✓ No schedule warnings</span>`;
}

function draftResults() {
  return {
    sales: Number(document.querySelector("#result-sales").value || 0),
    retailUnits: Number(document.querySelector("#result-retail-units").value || 0),
    shelvableUnits: Number(document.querySelector("#result-shelvable-units").value || 0),
    nonRetailUnits: Number(document.querySelector("#result-nonretail-units").value || 0),
    buybackDollars: Number(document.querySelector("#result-buyback-dollars").value || 0),
    newSignups: Number(document.querySelector("#result-new-signups").value || 0),
    blankTransactions: Number(document.querySelector("#result-blank-transactions").value || 0),
    totalTransactions: Number(document.querySelector("#result-total-transactions").value || 0),
    actualHours: Object.fromEntries([...document.querySelectorAll(".actual-hours-field")].map((input) => [input.dataset.associate, Number(input.value || 0)])),
  };
}

function renderResults() {
  const fields = {
    "#result-sales": "sales", "#result-retail-units": "retailUnits", "#result-shelvable-units": "shelvableUnits",
    "#result-nonretail-units": "nonRetailUnits", "#result-buyback-dollars": "buybackDollars",
    "#result-new-signups": "newSignups", "#result-blank-transactions": "blankTransactions", "#result-total-transactions": "totalTransactions",
  };
  Object.entries(fields).forEach(([selector, key]) => { document.querySelector(selector).value = state.results[key] || 0; });
  const schedule = currentSchedule();
  document.querySelector("#payroll-results-summary").innerHTML = `
    <div class="payroll-summary-head"><span>Associate</span><span>Scheduled</span><span>Worked</span><span>Actual cost</span></div>
    ${schedule.map((shift) => {
      const rate = Number(associateByName(shift.associate)?.payRate || 0);
      const worked = Number(state.results.actualHours?.[shift.associate] ?? shiftHours(shift));
      return `<label class="payroll-person"><strong>${esc(shift.associate)}</strong><span>${number(shiftHours(shift), 2)}h</span>
        <input class="actual-hours-field" data-associate="${esc(shift.associate)}" type="number" min="0" step=".25" value="${worked}" aria-label="${esc(shift.associate)} worked hours">
        <output>${money(worked * rate, 2)}</output></label>`;
    }).join("")}`;
  renderContestResults();
  updateResultCallouts();
}

function renderContestResults() {
  const contests = activeContests();
  document.querySelector("#contest-results-panel").hidden = contests.length === 0;
  document.querySelector("#contest-result-sections").innerHTML = contests.map((contest) => `
    <section class="contest-result-card" data-contest-id="${contest.id}">
      <div class="contest-result-head"><div><h4>${esc(contest.name)}</h4><span>Goal ${esc(formatContestResult(contest, contest.goal))}</span></div>
        <label>${contest.metric === "dollars" ? "Store dollars" : "Store units"}<input class="contest-result-field" data-field="result" type="number" min="0" step=".01" value="${contest.result}"></label>
        ${contest.id === "bookDrive" ? `<label>Donated units<input class="contest-result-field" data-field="units" type="number" min="0" value="${contest.units}"></label><label>Donation transactions<input class="contest-result-field" data-field="transactions" type="number" min="0" value="${contest.transactions}"></label>` : ""}
      </div>
      ${contest.id === "bookDrive" ? `<div class="contest-stat">Average donation transaction <strong>${contest.transactions ? money(contest.result / contest.transactions, 2) : "—"}</strong></div>` : ""}
      <div class="associate-tracker">
        ${state.associates.map((associate) => `<label><span>${esc(associate.name)}</span><input class="associate-contest-field" data-associate="${esc(associate.name)}" type="number" min="0" step=".01" value="${contest.associateResults?.[associate.name] || 0}"></label>`).join("")}
      </div>
    </section>`).join("");
}

function updateResultCallouts() {
  const result = draftResults();
  const budget = Number(currentBudget().budget || 0);
  const salesVariance = result.sales - budget;
  const buyback = safeDivide(result.shelvableUnits, result.retailUnits);
  const named = Math.max(0, result.totalTransactions - result.blankTransactions);
  const opportunity = safeDivide(result.newSignups, result.blankTransactions) * 100;
  const transaction = safeDivide(named, result.totalTransactions) * 100;
  document.querySelector("#result-named-transactions").value = named;
  const scheduledHours = dayScheduledHours(currentDayIndex());
  const scheduledCost = dayScheduledCost(currentDayIndex());
  const actualHours = Object.values(result.actualHours).reduce((sum, v) => sum + v, 0);
  const actualCost = Object.entries(result.actualHours).reduce((sum, [name, hours]) => sum + hours * Number(associateByName(name)?.payRate || 0), 0);
  document.querySelector("#sales-callout").textContent = `${varianceText(salesVariance)} ${salesVariance >= 0 ? "above" : "below"} today’s budget of ${money(budget)}.`;
  document.querySelector("#buyback-callout").textContent = `Today’s ratio: ${ratio(buyback)} · ${number(result.shelvableUnits)} shelvable from ${number(result.retailUnits)} retail units.`;
  document.querySelector("#loyalty-callout").innerHTML = `Opportunity loyalty: <strong>${percent(opportunity)}</strong> · Transaction loyalty: <strong>${percent(transaction)}</strong>`;
  document.querySelector("#payroll-callout").innerHTML = `
    <strong>${number(scheduledHours, 2)}h scheduled / ${number(actualHours, 2)}h worked</strong><br>
    ${money(scheduledCost, 2)} scheduled cost · ${money(actualCost, 2)} actual cost ·
    <span class="${actualCost <= currentBudget().payrollBudget ? "positive" : "negative"}">${money(Math.abs(currentBudget().payrollBudget - actualCost), 2)} ${actualCost <= currentBudget().payrollBudget ? "available" : "over budget"}</span>`;
}

function renderAgenda() {
  const calc = calculations();
  const date = new Date(`${state.operatingDate}T12:00:00`);
  document.querySelector("#agenda-date").textContent = `${new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)}\n${dateText(state.operatingDate, { month: "long", day: "numeric", year: "numeric" })}`;
  const metrics = [
    ["Today’s budget", money(calc.budget.budget)], ["WTD sales", money(calc.wtdSales)],
    ["To budget", varianceText(calc.wtdVariance)], ["Opportunity loyalty", percent(calc.opportunityLoyalty)],
    ["Buyback ratio", ratio(calc.buybackRatio)],
  ];
  document.querySelector("#agenda-metrics").innerHTML = metrics.map(([label, value]) => `<div class="agenda-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  document.querySelector("#agenda-schedule").innerHTML = currentSchedule().map((shift) => `
    <tr><td><strong>${esc(shift.associate)}</strong></td><td>${esc(timeText(shift.start))}–${esc(timeText(shift.end))}</td><td><strong>${esc(shift.position)}</strong></td><td>${esc(shift.breakAt || "—")}</td><td>${esc(shift.assignment)}</td></tr>`).join("");
  document.querySelector("#agenda-priorities").innerHTML = state.priorities.map((priority) => `<li>${esc(priority)}</li>`).join("");
  const contests = activeContests();
  const contestSection = document.querySelector("#agenda-contests").closest("section");
  contestSection.hidden = contests.length === 0;
  document.querySelector("#agenda-contests").innerHTML = contests.map((contest) => {
    const extra = contest.id === "bookDrive" ? ` · ${number(contest.units)} units · Avg ${contest.transactions ? money(contest.result / contest.transactions, 2) : "—"}` : "";
    return `<div class="agenda-contest-line"><strong>${esc(contest.name)}</strong><span>${esc(formatContestResult(contest))} / ${esc(formatContestResult(contest, contest.goal))}${esc(extra)}</span></div>`;
  }).join("");
  document.querySelector("#agenda-message").textContent = state.teamMessage;
}

function renderNightly() {
  const managers = state.associates.filter((a) => ["GM", "ASM", "MOD"].includes(a.role)).map((a) => a.name);
  document.querySelector("#nightly-mod").innerHTML = managers.map((name) => `<option ${selected(name, state.nightly.mod)}>${esc(name)}</option>`).join("");
  ["wins", "opportunities", "followup", "handoff"].forEach((key) => { document.querySelector(`#nightly-${key}`).value = state.nightly[key]; });
}

function renderAll() {
  document.querySelector("#operating-date").value = state.operatingDate;
  renderToday(); renderSetup(); renderGoals(); renderSchedule(); renderResults(); renderAgenda(); renderNightly();
}

function updateBudgetTotalsFromInputs() {
  const rows = [...document.querySelectorAll("[data-budget-index]")];
  const total = (field) => rows.reduce((sum, row) => sum + Number(row.querySelector(`[data-field="${field}"]`).value || 0), 0);
  document.querySelector("#budget-total").textContent = money(total("budget"));
  document.querySelector("#ly-total").textContent = money(total("lastYear"));
  document.querySelector("#buyback-goal-total").textContent = number(total("buybackGoal"));
  document.querySelector("#buyback-ly-total").textContent = number(total("lyBuybackUnits"));
  const ratioRows = rows.map((row) => ({
    units: Number(row.querySelector('[data-field="lyBuybackUnits"]').value || 0),
    ratio: Number(row.querySelector('[data-field="lyBuybackRatio"]').value || 0),
  })).filter((row) => row.units && row.ratio);
  const estimatedRetail = ratioRows.reduce((sum, row) => sum + row.units / row.ratio, 0);
  document.querySelector("#buyback-ratio-total").textContent = estimatedRetail ? ratio(ratioRows.reduce((sum, row) => sum + row.units, 0) / estimatedRetail) : "—";
  document.querySelector("#payroll-budget-total").textContent = money(total("payrollBudget"));
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
  const oldNames = state.associates.map((a) => a.name);
  state.store = { number: document.querySelector("#store-number").value.trim(), name: document.querySelector("#store-name").value.trim(), gm: document.querySelector("#gm-name").value.trim(), weekStart: document.querySelector("#week-start").value };
  state.associates = [...document.querySelectorAll("[data-associate-index]")].map((row) => ({
    name: row.querySelector('[data-field="name"]').value.trim(), id: row.querySelector('[data-field="id"]').value.trim(),
    role: row.querySelector('[data-field="role"]').value, payRate: Number(row.querySelector('[data-field="payRate"]').value || 0),
  })).filter((a) => a.name);
  state.contestsEnabled = document.querySelector("#contests-enabled").checked;
  [...document.querySelectorAll("[data-contest-index]")].forEach((row, index) => {
    state.contests[index].active = row.querySelector('[data-field="active"]').checked;
    state.contests[index].name = row.querySelector('[data-field="name"]').value.trim();
    state.contests[index].metric = row.querySelector('[data-field="metric"]').value;
    state.contests[index].goal = Number(row.querySelector('[data-field="goal"]').value || 0);
  });
  state.weeklySchedule.flat().forEach((shift) => {
    const idx = oldNames.indexOf(shift.associate);
    if (idx >= 0 && state.associates[idx]) shift.associate = state.associates[idx].name;
  });
  persist("Store, associates, pay rates, and contest controls saved."); renderAll();
}

function saveGoals() {
  state.budgets = [...document.querySelectorAll("[data-budget-index]")].map((row, index) => ({
    day: state.budgets[index].day, ...Object.fromEntries(["date", "budget", "lastYear", "buybackGoal", "lyBuybackUnits", "lyBuybackRatio", "payrollBudget"].map((field) => {
      const value = row.querySelector(`[data-field="${field}"]`).value;
      return [field, field === "date" ? value : Number(value || 0)];
    })),
  }));
  document.querySelectorAll(".goal-field").forEach((input) => { state.goals[input.dataset.goal] = Number(input.value || 0); });
  persist("Sales, buyback, loyalty, and payroll plans saved."); renderAll();
}

function collectSchedule() {
  state.weeklySchedule[state.selectedScheduleDay] = [...document.querySelectorAll("[data-shift-index]")].map((row) => ({
    associate: row.querySelector('[data-field="associate"]').value, start: row.querySelector('[data-field="start"]').value,
    end: row.querySelector('[data-field="end"]').value, position: row.querySelector('[data-field="position"]').value,
    breakAt: row.querySelector('[data-field="breakAt"]').value.trim(), breakMinutes: Number(row.querySelector('[data-field="breakMinutes"]').value || 0),
    assignment: row.querySelector('[data-field="assignment"]').value.trim(),
  }));
}
function saveSchedule() {
  collectSchedule();
  state.priorities = [...document.querySelectorAll(".priority-field")].map((input) => input.value.trim()).filter(Boolean);
  state.teamMessage = document.querySelector("#team-message").value.trim();
  persist("Weekly schedule and assignments saved."); renderAll();
}

function saveResults() {
  state.results = draftResults();
  activeContests().forEach((contest) => {
    const section = document.querySelector(`[data-contest-id="${contest.id}"]`);
    if (!section) return;
    section.querySelectorAll(".contest-result-field").forEach((input) => { contest[input.dataset.field] = Number(input.value || 0); });
    contest.associateResults = Object.fromEntries([...section.querySelectorAll(".associate-contest-field")].map((input) => [input.dataset.associate, Number(input.value || 0)]));
  });
  persist("Daily results, payroll, and contests saved."); renderAll();
}

function generateNightlyReport() {
  state.nightly = Object.fromEntries(["mod", "wins", "opportunities", "followup", "handoff"].map((key) => [key, document.querySelector(`#nightly-${key}`).value.trim()]));
  const calc = calculations();
  const contestLines = activeContests().map((contest) => {
    const leaders = Object.entries(contest.associateResults || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, value]) => `${name} ${contest.metric === "dollars" ? money(value) : number(value)}`).join(", ");
    return `${contest.name}: ${formatContestResult(contest)} / ${formatContestResult(contest, contest.goal)}${contest.id === "bookDrive" ? `; ${number(contest.units)} units; avg transaction ${contest.transactions ? money(contest.result / contest.transactions, 2) : "—"}` : ""}${leaders ? `; leaders: ${leaders}` : ""}`;
  });
  const report = [
    `STORE ${state.store.number} ${state.store.name.toUpperCase()} — NIGHTLY REPORT`,
    dateText(state.operatingDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), `Closing MOD: ${state.nightly.mod}`, "",
    "PERFORMANCE", `Sales: ${money(calc.sales)} (${varianceText(calc.salesVariance)} to budget)`,
    `WTD Sales: ${money(calc.wtdSales)} (${varianceText(calc.wtdVariance)} to budget; ${varianceText(calc.lyVariance)} to LY)`,
    `Opportunity Loyalty: ${percent(calc.opportunityLoyalty)} (goal ${percent(state.goals.loyalty)})`,
    `Transaction Loyalty: ${percent(calc.transactionLoyalty)}`,
    `Buyback Ratio: ${ratio(calc.buybackRatio)} (goal ${ratio(state.goals.buybackRatio)})`,
    `Payroll: ${number(calc.actualHours, 2)} worked / ${number(calc.scheduledHours, 2)} scheduled hours; ${money(calc.actualCost, 2)} actual / ${money(calc.scheduledCost, 2)} scheduled cost`,
    ...(contestLines.length ? ["", "ACTIVE CONTESTS", ...contestLines] : []), "",
    "WINS / CELEBRATIONS", state.nightly.wins || "None noted.", "", "OPPORTUNITIES / MISSES", state.nightly.opportunities || "None noted.", "",
    "FOLLOW-UP", state.nightly.followup || "None noted.", "", "TOMORROW’S HANDOFF", state.nightly.handoff || "None noted.",
  ].join("\n");
  document.querySelector("#report-preview").textContent = report;
  persist("Nightly report generated and saved.");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]"); const go = event.target.closest("[data-go]");
  if (nav) goTo(nav.dataset.page); if (go) goTo(go.dataset.go);
  if (event.target.closest("#menu-button")) document.body.classList.toggle("nav-open");
  if (event.target.closest("#save-setup")) saveSetup();
  if (event.target.closest("#save-goals")) saveGoals();
  if (event.target.closest("#save-schedule")) saveSchedule();
  if (event.target.closest("#save-results")) saveResults();
  if (event.target.closest("#generate-report")) generateNightlyReport();
  if (event.target.closest("#print-agenda")) window.print();
  const dayTab = event.target.closest("[data-schedule-day]");
  if (dayTab) { collectSchedule(); state.selectedScheduleDay = Number(dayTab.dataset.scheduleDay); renderSchedule(); }
  if (event.target.closest("#add-associate")) { state.associates.push({ name: "New associate", id: "", role: "Associate", payRate: 14 }); renderSetup(); }
  const removeAssociate = event.target.closest(".remove-associate");
  if (removeAssociate) { state.associates.splice(Number(removeAssociate.closest("[data-associate-index]").dataset.associateIndex), 1); renderSetup(); }
  if (event.target.closest("#add-shift")) {
    collectSchedule(); state.weeklySchedule[state.selectedScheduleDay].push({ associate: state.associates[0]?.name || "Associate", start: "09:00", end: "17:00", position: "Floor", breakAt: "1:00", breakMinutes: 30, assignment: "" }); renderSchedule();
  }
  const removeShift = event.target.closest(".remove-shift");
  if (removeShift) { collectSchedule(); state.weeklySchedule[state.selectedScheduleDay].splice(Number(removeShift.closest("[data-shift-index]").dataset.shiftIndex), 1); renderSchedule(); }
  const duplicateShift = event.target.closest(".duplicate-shift");
  if (duplicateShift) { collectSchedule(); const i = Number(duplicateShift.closest("[data-shift-index]").dataset.shiftIndex); state.weeklySchedule[state.selectedScheduleDay].splice(i + 1, 0, clone(state.weeklySchedule[state.selectedScheduleDay][i])); renderSchedule(); }
  if (event.target.closest("#copy-previous-day")) {
    collectSchedule(); const prior = state.selectedScheduleDay === 0 ? 6 : state.selectedScheduleDay - 1; state.weeklySchedule[state.selectedScheduleDay] = clone(state.weeklySchedule[prior]); renderSchedule(); showToast("Previous day copied. Save when ready.");
  }
  if (event.target.closest("#copy-week")) { state.weeklySchedule = clone(defaultState.weeklySchedule); renderSchedule(); showToast("Demo week copied. Save when ready."); }
  if (event.target.closest("#copy-report")) navigator.clipboard.writeText(document.querySelector("#report-preview").textContent).then(() => showToast("Nightly report copied.")).catch(() => showToast("Copy was blocked. Select the report text to copy it."));
  if (event.target.closest("#reset-demo") && window.confirm("Reset all prototype entries on this device to the original sample data?")) {
    state = clone(defaultState); localStorage.removeItem(STORAGE_KEY); renderAll(); goTo("today"); showToast("Prototype reset.");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".budget-field")) updateBudgetTotalsFromInputs();
  if (event.target.closest("#page-results")) updateResultCallouts();
  if (event.target.matches(".contest-result-field")) {
    const section = event.target.closest("[data-contest-id]"); const contest = state.contests.find((c) => c.id === section.dataset.contestId);
    if (contest?.id === "bookDrive") {
      const result = Number(section.querySelector('[data-field="result"]').value || 0); const transactions = Number(section.querySelector('[data-field="transactions"]').value || 0);
      section.querySelector(".contest-stat strong").textContent = transactions ? money(result / transactions, 2) : "—";
    }
  }
  if (event.target.matches(".shift-field")) {
    collectSchedule(); renderWeekOverview(); renderScheduleWarnings();
    const row = event.target.closest("[data-shift-index]"); const shift = state.weeklySchedule[state.selectedScheduleDay][Number(row.dataset.shiftIndex)];
    row.querySelectorAll("output")[0].textContent = `${number(shiftHours(shift), 2)}h`; row.querySelectorAll("output")[1].textContent = money(shiftCost(shift), 2);
  }
});
document.querySelector("#contests-enabled").addEventListener("change", (event) => document.querySelector("#contest-setup-rows").classList.toggle("disabled-section", !event.target.checked));
document.querySelector("#operating-date").addEventListener("change", (event) => {
  state.operatingDate = event.target.value; const index = state.budgets.findIndex((row) => row.date === state.operatingDate); if (index >= 0) state.selectedScheduleDay = index;
  persist("Operating date updated."); renderAll();
});

renderAll();
