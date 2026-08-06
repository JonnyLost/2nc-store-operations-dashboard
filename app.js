const STORAGE_KEY = "store-operations-production-v1";
const LEGACY_STORAGE_KEY = "store-operations-demo-v3";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const positions = ["MOD", "Register Area", "Shelver", "Truck", "Associate", "Buyback", "Training", "Greeter", "Mythical Being"];
const roles = ["DMIT", "GM", "GMIT", "ASM", "MOD", "Associate"];
const overtimeExemptRoles = new Set(["DMIT", "GM", "GMIT"]);
const quickModeHiddenPages = new Set(["setup", "goals", "agenda", "periods"]);
let access = { role: "demo", canViewPayroll: true, canViewCommunications: true };
let factOffset = 0;
const dailyFacts = [
  { category: "Music", text: "Beethoven conducted the premiere of his Ninth Symphony in Vienna in 1824, when he was already profoundly deaf." },
  { category: "Books", text: "Mary Shelley's Frankenstein was first published anonymously in 1818; her name appeared on the second edition in 1823." },
  { category: "Movies", text: "The Jazz Singer, released in 1927, helped popularize synchronized dialogue in feature films." },
  { category: "History", text: "The shortest war commonly recorded was the Anglo-Zanzibar War of 1896, which lasted less than an hour." },
  { category: "Television", text: "I Love Lucy was filmed before a live studio audience using three cameras, a format that became a sitcom standard." },
  { category: "Pop Culture", text: "The first modern crossword puzzle appeared in the New York World in December 1913." },
  { category: "Music", text: "The Beatles played their final public concert on the roof of Apple Corps in London on January 30, 1969." },
  { category: "Books", text: "J.R.R. Tolkien began writing The Hobbit after jotting down its famous opening sentence while grading papers." },
  { category: "Movies", text: "The roar of the T. rex in Jurassic Park combined recordings of several animals, including an elephant, alligator, and tiger." },
  { category: "History", text: "Oxford University was teaching students before the Aztec Empire was founded." },
  { category: "Television", text: "The first episode of Saturday Night Live aired on October 11, 1975, with George Carlin as host." },
  { category: "Pop Culture", text: "The Rubik's Cube was invented in 1974 by Hungarian architecture professor Ernő Rubik." },
  { category: "Music", text: "The compact disc was introduced commercially in 1982; one of the first major titles released on CD was ABBA's The Visitors." },
  { category: "Books", text: "Agatha Christie's novels have been translated into more than 100 languages." },
  { category: "Movies", text: "Toy Story, released in 1995, was the first feature-length film made entirely with computer animation." },
  { category: "History", text: "The ancient Roman city of Pompeii was rediscovered in the 18th century after being buried by Mount Vesuvius in 79 CE." },
  { category: "Television", text: "Sesame Street premiered in 1969 and was created to combine television entertainment with early-childhood education." },
  { category: "Pop Culture", text: "The first official Star Wars action figures reached stores in 1978 after demand outpaced the original production schedule." },
  { category: "Music", text: "John Williams wrote the famous two-note shark motif for Jaws to suggest a relentless, instinctive threat." },
  { category: "Books", text: "The first volume of the Oxford English Dictionary took more than 40 years of work before the full first edition was completed." },
  { category: "Movies", text: "The Wizard of Oz shifts from sepia-toned Kansas to Technicolor Oz as Dorothy opens the farmhouse door." },
  { category: "History", text: "Cleopatra lived closer in time to the Moon landing than to the construction of Egypt's Great Pyramid of Giza." },
  { category: "Television", text: "Star Trek's original series premiered in 1966 and ran for three seasons before becoming a much larger franchise." },
  { category: "Pop Culture", text: "LEGO's name comes from the Danish phrase “leg godt,” meaning “play well.”" },
  { category: "Music", text: "The word karaoke combines Japanese words meaning “empty” and “orchestra.”" },
  { category: "Books", text: "Dr. Seuss wrote Green Eggs and Ham after a challenge to create a book using only 50 different words." },
  { category: "Movies", text: "Psycho's famous shower scene was assembled from dozens of rapid shots and took about a week to film." },
  { category: "History", text: "The first successful powered airplane flight by the Wright brothers lasted 12 seconds on December 17, 1903." },
  { category: "Television", text: "The Twilight Zone premiered in 1959 with Rod Serling serving as creator, principal writer, and on-screen host." },
  { category: "Pop Culture", text: "Pac-Man was designed to attract a broader audience than the space-shooter games dominating arcades in 1980." },
  { category: "Music", text: "Queen's Bohemian Rhapsody has no conventional repeating chorus, despite becoming one of rock's best-known singles." },
  { category: "Books", text: "The working title for George Orwell's Nineteen Eighty-Four was The Last Man in Europe." },
  { category: "Movies", text: "The lightsaber hum in Star Wars was built from the sounds of a film-projector motor and interference picked up by a microphone." },
  { category: "History", text: "The Pony Express operated for only about 18 months, from 1860 to 1861." },
  { category: "Television", text: "Mister Rogers began each episode by changing into a cardigan and sneakers to create a familiar transition into his television neighborhood." },
  { category: "Pop Culture", text: "Nintendo was founded in 1889, decades before video games, as a maker of playing cards." },
  { category: "Music", text: "Miles Davis recorded much of Kind of Blue with musicians working from sketches rather than fully written arrangements." },
  { category: "Books", text: "Ray Bradbury wrote the first draft of Fahrenheit 451 on rented typewriters in a university library basement." },
  { category: "Movies", text: "The stop-motion skeleton battle in Jason and the Argonauts took animator Ray Harryhausen months to complete." },
  { category: "History", text: "The Statue of Liberty was a gift from France and was dedicated in New York Harbor in 1886." },
  { category: "Television", text: "The Muppet Show was produced in the United Kingdom after U.S. networks initially passed on the series." },
  { category: "Pop Culture", text: "The first issue of Action Comics, which introduced Superman, was published in 1938." },
];
const pageNames = {
  today: ["Today", "Daily command center"],
  setup: ["Store setup", "One-time foundation"],
  goals: ["Budgets & goals", "Weekly plan"],
  schedule: ["Schedule", "People plan"],
  results: ["Daily results", "Live scorecard"],
  agenda: ["Print agenda", "Associate huddle sheet"],
  nightly: ["Nightly report", "Closing MOD workflow"],
  midday: ["Midday report", "Time-stamped update"],
  communications: ["Communication log", "Manager-only history"],
  periods: ["End-of reports", "Period close"],
};

const demoShifts = [
  { associate: "Demo Manager", start: "08:00", end: "17:00", position: "MOD", breakMinutes: 60, breakAt: "1:00", assignment: "Open / floor leadership" },
  { associate: "Demo Assistant", start: "09:00", end: "18:00", position: "Buyback", breakMinutes: 30, breakAt: "1:30", assignment: "Buyback & training" },
  { associate: "Demo Lead", start: "11:00", end: "20:00", position: "MOD", breakMinutes: 60, breakAt: "3:00", assignment: "Closing MOD / recovery" },
  { associate: "Associate A", start: "10:00", end: "18:30", position: "Shelver", breakMinutes: 30, breakAt: "2:00", assignment: "Fiction reset / Book Drive" },
  { associate: "Associate B", start: "12:00", end: "20:00", position: "Associate", breakMinutes: 30, breakAt: "4:00", assignment: "Media go-backs / Mystery Box" },
  { associate: "Associate C", start: "16:00", end: "20:00", position: "Register Area", breakMinutes: 0, breakAt: "—", assignment: "Loyalty / closing recovery" },
];

const defaultState = {
  fiscalYear: 2027,
  fiscalWeek: 26,
  operatingDate: "2026-07-30",
  selectedScheduleDay: 4,
  store: { number: "DEMO", name: "Sample Store", gm: "Demo Manager", weekStart: "Sunday" },
  payrollToolsActive: true,
  keyboardShortcutsActive: true,
  dashboardMode: "full",
  associates: [
    { name: "Demo Manager", id: "SAMPLE-A", loginName: "", role: "GM", payRate: 24.5 },
    { name: "Demo Assistant", id: "SAMPLE-B", loginName: "", role: "ASM", payRate: 20.25 },
    { name: "Demo Lead", id: "SAMPLE-C", loginName: "", role: "MOD", payRate: 17.75 },
    { name: "Associate A", id: "SAMPLE-D", loginName: "", role: "Associate", payRate: 14.25 },
    { name: "Associate B", id: "SAMPLE-E", loginName: "", role: "Associate", payRate: 14.75 },
    { name: "Associate C", id: "SAMPLE-F", loginName: "", role: "Associate", payRate: 13.75 },
    { name: "Associate D", id: "SAMPLE-G", loginName: "", role: "Associate", payRate: 14.5 },
    { name: "Associate E", id: "SAMPLE-H", loginName: "", role: "Associate", payRate: 13.5 },
  ],
  budgets: [
    { day: "Sunday", date: "2026-07-26", budget: 5125, lastYear: 4980, buybackGoal: 360, lyBuybackUnits: 338, lyBuybackRatio: 1.084, payrollBudget: 970, isHoliday: false, holidayName: "", holidayMultiplier: 1.5 },
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
      0: { "Demo Manager": "Associate D", "Demo Assistant": "Associate E" },
      1: { "Demo Lead": "Associate D" },
      2: { "Demo Assistant": "Associate D", "Associate A": "Associate E" },
      3: { "Demo Manager": "Associate D", "Associate B": "Associate E" },
      5: { "Demo Assistant": "Associate E" },
      6: { "Demo Lead": "Associate D", "Associate A": "Associate E" },
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
    sales: 4510, receivedUnits: 380, shelvableUnits: 342, nonRetailUnits: 38, usedUnitsSold: 280,
    newSignups: 7, blankTransactions: 42, totalTransactions: 238,
    actualHours: { "Demo Manager": 8, "Demo Assistant": 8.25, "Demo Lead": 8, "Associate A": 7.75, "Associate B": 7.25, "Associate C": 4 },
  },
  actualHoursByDate: {
    "2026-07-30": { "Demo Manager": 8, "Demo Assistant": 8.25, "Demo Lead": 8, "Associate A": 7.75, "Associate B": 7.25, "Associate C": 4 },
  },
  beforeToday: {
    sales: 17885, lastYearSales: 16665, receivedUnits: 1350, nonRetailUnits: 120, shelvableUnits: 1230, usedUnitsSold: 1120,
    newSignups: 36, blankTransactions: 240, totalTransactions: 1410, payrollCost: 3125,
  },
  contestsEnabled: true,
  contests: [
    {
      id: "bookDrive", name: "Book Drive", active: true, metric: "dollars", goal: 250,
      startWeek: 25, endWeek: 28,
      result: 82, units: 49, transactions: 31,
      associateResults: { "Demo Manager": 15, "Demo Assistant": 18, "Demo Lead": 14, "Associate A": 21, "Associate B": 8, "Associate C": 6 },
      weeklyResults: { "2027-W25": { result: 47, units: 28, transactions: 18, associateResults: { "Demo Manager": 9, "Demo Assistant": 11, "Demo Lead": 8, "Associate A": 10, "Associate B": 5, "Associate C": 4 } } },
    },
    {
      id: "coffeeTroops", name: "Coffee for the Troops", active: true, metric: "units", goal: 100,
      startWeek: 25, endWeek: 28,
      result: 38, units: 38, transactions: 0,
      associateResults: { "Demo Manager": 8, "Demo Assistant": 7, "Demo Lead": 6, "Associate A": 7, "Associate B": 6, "Associate C": 4 },
      weeklyResults: { "2027-W25": { result: 22, units: 22, transactions: 0, associateResults: { "Demo Manager": 5, "Demo Assistant": 4, "Demo Lead": 4, "Associate A": 4, "Associate B": 3, "Associate C": 2 } } },
    },
    {
      id: "mysteryBoxes", name: "Mystery Boxes", active: false, metric: "units", goal: 20,
      startWeek: 26, endWeek: 30,
      result: 14, units: 14, transactions: 0, associateResults: {},
    },
  ],
  associateDaily: {},
  weeks: {},
  communications: [
    { dateTime: "2026-07-29T10:30", associate: "Associate A", manager: "Demo Manager", category: "Recognition", notes: "Recognized strong customer service and ownership of the Fiction reset.", followup: "", status: "Resolved" },
    { dateTime: "2026-07-30T09:15", associate: "Associate B", manager: "Demo Manager", category: "General", notes: "Reviewed today’s media priorities and closing expectations.", followup: "2026-07-31", status: "Follow-up" },
  ],
  reportSnapshots: [],
  dailyWorkflow: {},
  nightly: {
    mod: "Demo Lead",
    wins: "Finished above budget and loyalty goal. Strong buyback flow through the afternoon.",
    opportunities: "Recovery slipped during the 5–6 PM traffic peak.",
    followup: "Check the loose fixture in Young Adult tomorrow morning.",
    handoff: "Finish the Fiction reset and verify Saturday’s staffing.",
  },
};

let state = loadState();
let toastTimer;
let openPhase;

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
function normalizeTimeInput(value) {
  const raw = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!raw) return "";
  const suffix = raw.match(/(am|pm|a|p)$/)?.[0] || "";
  const digits = raw.replace(/(am|pm|a|p)$/, "").replace(".", ":");
  let hours; let minutes;
  if (digits.includes(":")) {
    [hours, minutes = "0"] = digits.split(":").map(Number);
  } else if (/^\d{3,4}$/.test(digits)) {
    hours = Number(digits.slice(0, -2)); minutes = Number(digits.slice(-2));
  } else if (/^\d{1,2}$/.test(digits)) {
    hours = Number(digits); minutes = 0;
  } else {
    return "";
  }
  if (suffix) {
    if (hours < 1 || hours > 12) return "";
    if (suffix.startsWith("p") && hours !== 12) hours += 12;
    if (suffix.startsWith("a") && hours === 12) hours = 0;
  }
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function initials(name) { return String(name).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
function selected(value, match) { return value === match ? "selected" : ""; }
function checked(value) { return value ? "checked" : ""; }
function normalizedPosition(value) {
  const replacements = {
    Register: "Register Area", "Buy Counter": "Buyback", Books: "Shelver",
    Media: "Associate", Comics: "Associate", Floor: "Associate", Projects: "Associate",
  };
  const normalized = replacements[value] || value;
  return positions.includes(normalized) ? normalized : "Associate";
}
function safeDivide(a, b) { return Number(b) ? Number(a) / Number(b) : NaN; }
function varianceClass(value) { return value >= 0 ? "positive" : "negative"; }
function varianceText(value) { return `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`; }
function weekKey(year = state.fiscalYear, week = state.fiscalWeek) { return `${year}-W${String(week).padStart(2, "0")}`; }
function fiscalWeekStart(year, week) {
  const anchor = new Date("2026-07-26T12:00:00");
  const offset = ((Number(year) - 2027) * 52 + (Number(week) - 26)) * 7;
  const date = new Date(anchor); date.setDate(date.getDate() + offset);
  return date;
}
function dateValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function emptyWeek(year, week) {
  const start = fiscalWeekStart(year, week);
  const budgets = days.map((day, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index);
    return { day, date: dateValue(date), budget: 0, lastYear: 0, buybackGoal: 0, lyBuybackUnits: 0, lyBuybackRatio: 0, payrollBudget: 0, isHoliday: false, holidayName: "", holidayMultiplier: 1.5 };
  });
  return {
    budgets, weeklySchedule: days.map(() => []), priorities: [], teamMessage: "", results: {
      sales: 0, receivedUnits: 0, shelvableUnits: 0, nonRetailUnits: 0, usedUnitsSold: 0,
      newSignups: 0, blankTransactions: 0, totalTransactions: 0, actualHours: {},
    }, beforeToday: { sales: 0, lastYearSales: 0, receivedUnits: 0, nonRetailUnits: 0, shelvableUnits: 0, usedUnitsSold: 0, newSignups: 0, blankTransactions: 0, totalTransactions: 0, payrollCost: 0 },
    associateDaily: {}, actualHoursByDate: {},
  };
}
function snapshotCurrentWeek() {
  state.weeks ||= {};
  state.weeks[weekKey()] = clone({
    budgets: state.budgets, weeklySchedule: state.weeklySchedule, priorities: state.priorities,
    teamMessage: state.teamMessage, results: state.results, beforeToday: state.beforeToday,
    associateDaily: state.associateDaily, actualHoursByDate: state.actualHoursByDate,
  });
}
function activateWeek(year, week, preferredDate = "") {
  snapshotCurrentWeek();
  state.fiscalYear = Number(year); state.fiscalWeek = Number(week);
  const key = weekKey();
  if (!state.weeks[key]) state.weeks[key] = emptyWeek(state.fiscalYear, state.fiscalWeek);
  Object.assign(state, clone(state.weeks[key]));
  state.results.receivedUnits = Number(state.results.receivedUnits ?? state.results.retailUnits ?? 0);
  state.results.usedUnitsSold = Number(state.results.usedUnitsSold ?? state.results.retailUnits ?? 0);
  state.results.shelvableUnits = Math.max(0, state.results.receivedUnits - Number(state.results.nonRetailUnits || 0));
  state.beforeToday.receivedUnits = Number(state.beforeToday.receivedUnits ?? state.beforeToday.shelvableUnits ?? 0);
  state.beforeToday.usedUnitsSold = Number(state.beforeToday.usedUnitsSold ?? state.beforeToday.retailUnits ?? 0);
  state.beforeToday.nonRetailUnits = Number(state.beforeToday.nonRetailUnits ?? Math.max(0, state.beforeToday.receivedUnits - Number(state.beforeToday.shelvableUnits || 0)));
  state.beforeToday.shelvableUnits = Math.max(0, state.beforeToday.receivedUnits - state.beforeToday.nonRetailUnits);
  const validDate = state.budgets.some((row) => row.date === preferredDate) ? preferredDate : state.budgets[0].date;
  state.operatingDate = validDate;
  state.selectedScheduleDay = Math.max(0, state.budgets.findIndex((row) => row.date === validDate));
  state.results.actualHours = clone(state.actualHoursByDate?.[validDate] || {});
}
function ensureAssociateDaily() {
  state.associateDaily ||= {};
  state.associates.forEach((associate, index) => {
    state.associateDaily[associate.name] ||= {
      buybackReceived: index < 6 ? [62, 72, 54, 68, 65, 59][index] : 0,
      buybackNonRetail: index < 6 ? [5, 7, 4, 8, 7, 7][index] : 0,
      contests: {},
    };
    activeContests().forEach((contest) => {
      const entry = state.associateDaily[associate.name];
      entry.contests[contest.id] ||= {
        result: Number(contest.associateResults?.[associate.name] || 0),
        units: contest.id === "bookDrive" ? Math.round(Number(contest.associateResults?.[associate.name] || 0) / 2) : 0,
        transactions: contest.id === "bookDrive" ? Math.max(0, Math.round(Number(contest.associateResults?.[associate.name] || 0) / 3)) : 0,
      };
    });
  });
  activeContests().forEach((contest) => {
    contest.weeklyResults ||= {};
    if (!contest.weeklyResults[weekKey()]) {
      const week = { result: 0, units: 0, transactions: 0, associateResults: {} };
      state.associates.forEach((associate) => {
        const values = state.associateDaily[associate.name]?.contests?.[contest.id] || {};
        week.result += Number(values.result || 0); week.units += Number(values.units || 0); week.transactions += Number(values.transactions || 0);
        week.associateResults[associate.name] = Number(values.result || 0);
      });
      contest.weeklyResults[weekKey()] = week;
    }
  });
}

function migrate(saved) {
  const merged = { ...clone(defaultState), ...saved };
  merged.dashboardMode = saved.dashboardMode === "quick" ? "quick" : "full";
  merged.associates = (saved.associates || defaultState.associates).map((a, i) => ({
    ...a,
    loginName: String(a.loginName || "").trim(),
    payRate: Number(a.payRate ?? defaultState.associates[i]?.payRate ?? 14),
  }));
  merged.budgets = (saved.budgets || defaultState.budgets).map((row, index) => ({
    ...clone(defaultState.budgets[index] || {}), ...row,
    isHoliday: Boolean(row.isHoliday),
    holidayName: String(row.holidayName || ""),
    holidayMultiplier: Number(row.holidayMultiplier) === 2 ? 2 : 1.5,
  }));
  merged.weeklySchedule = saved.weeklySchedule || days.map((_, i) => i === 4 ? clone(saved.schedule || demoShifts) : clone(defaultState.weeklySchedule[i]));
  merged.weeklySchedule = merged.weeklySchedule.map((schedule) => schedule.map((shift) => ({ ...shift, position: normalizedPosition(shift.position) })));
  merged.results = { ...clone(defaultState.results), ...(saved.results || {}) };
  merged.results.receivedUnits = Number(saved.results?.receivedUnits ?? saved.results?.retailUnits ?? merged.results.receivedUnits);
  merged.results.usedUnitsSold = Number(saved.results?.usedUnitsSold ?? saved.results?.retailUnits ?? merged.results.usedUnitsSold);
  merged.results.shelvableUnits = Math.max(0, merged.results.receivedUnits - Number(merged.results.nonRetailUnits || 0));
  merged.beforeToday = { ...clone(defaultState.beforeToday), ...(saved.beforeToday || {}) };
  merged.beforeToday.receivedUnits = Number(saved.beforeToday?.receivedUnits ?? saved.beforeToday?.shelvableUnits ?? merged.beforeToday.receivedUnits);
  merged.beforeToday.usedUnitsSold = Number(saved.beforeToday?.usedUnitsSold ?? saved.beforeToday?.retailUnits ?? merged.beforeToday.usedUnitsSold);
  merged.beforeToday.nonRetailUnits = Number(saved.beforeToday?.nonRetailUnits ?? Math.max(0, merged.beforeToday.receivedUnits - Number(merged.beforeToday.shelvableUnits || 0)));
  merged.beforeToday.shelvableUnits = Math.max(0, merged.beforeToday.receivedUnits - merged.beforeToday.nonRetailUnits);
  merged.contests = saved.contests || clone(defaultState.contests);
  merged.communications = saved.communications || clone(defaultState.communications);
  merged.reportSnapshots = saved.reportSnapshots || [];
  merged.dailyWorkflow = saved.dailyWorkflow || {};
  merged.weeks = saved.weeks || {};
  merged.associateDaily = saved.associateDaily || {};
  merged.actualHoursByDate = clone(saved.actualHoursByDate || {});
  if (!merged.actualHoursByDate[merged.operatingDate] && Object.keys(merged.results.actualHours || {}).length) {
    merged.actualHoursByDate[merged.operatingDate] = clone(merged.results.actualHours);
  }
  return merged;
}
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved ? migrate(JSON.parse(saved)) : migrate(clone(defaultState));
  }
  catch { return migrate(clone(defaultState)); }
}
function persist(message = "Saved. Dashboard and agenda updated.") {
  snapshotCurrentWeek();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.StoreOpsProduction?.queueSave(clone(state));
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
function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
function signedInUserName() {
  return String(window.STORE_OPS_WP?.user?.name || "").trim();
}
function signedInUserLogin() {
  return String(window.STORE_OPS_WP?.user?.login || "").trim();
}
function userFirstName() {
  return signedInUserName().split(/\s+/)[0] || "team";
}
function normalizedName(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function normalizedLogin(value) {
  return String(value || "").trim().toLowerCase();
}
function shiftsForSignedInUser() {
  const login = normalizedLogin(signedInUserLogin());
  if (login) {
    const associate = state.associates.find((person) => normalizedLogin(person.loginName) === login);
    if (associate) {
      return currentSchedule().filter((shift) => normalizedName(shift.associate) === normalizedName(associate.name));
    }
  }
  const fullName = normalizedName(signedInUserName());
  if (!fullName) return [];
  const firstName = fullName.split(" ")[0];
  const exact = currentSchedule().filter((shift) => normalizedName(shift.associate) === fullName);
  if (exact.length) return exact;
  const firstNameMatches = currentSchedule().filter((shift) => {
    const shiftFirstName = normalizedName(shift.associate).split(" ")[0];
    return shiftFirstName === firstName || (Math.min(shiftFirstName.length, firstName.length) >= 3 && (shiftFirstName.startsWith(firstName) || firstName.startsWith(shiftFirstName)));
  });
  const matchedNames = new Set(firstNameMatches.map((shift) => normalizedName(shift.associate)));
  return matchedNames.size === 1 ? firstNameMatches : [];
}
function userScheduleText() {
  if (!signedInUserName()) return "The full team schedule and assignments are ready below.";
  const shifts = shiftsForSignedInUser();
  if (!shifts.length) return "You aren’t listed on today’s schedule.";
  return shifts.map((shift) => {
    const role = shift.position ? ` · ${shift.position}` : "";
    const assignment = shift.assignment ? ` · ${shift.assignment}` : "";
    return `You’re scheduled ${timeText(shift.start)}–${timeText(shift.end)}${role}${assignment}.`;
  }).join(" ");
}
function dailyFactIndex(now = new Date()) {
  const start = Date.UTC(now.getFullYear(), 0, 0);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Math.floor((today - start) / 86400000);
  return (now.getFullYear() * 367 + day + factOffset) % dailyFacts.length;
}
function renderFact(now = new Date()) {
  const fact = dailyFacts[dailyFactIndex(now)];
  document.querySelector("#fact-category").textContent = fact.category;
  document.querySelector("#fact-of-the-day").textContent = fact.text;
}
function refreshTodayHeader(now = new Date()) {
  const greeting = document.querySelector("#today-greeting");
  const context = document.querySelector("#today-context");
  if (greeting) greeting.textContent = `${greetingForHour(now.getHours())}, ${userFirstName()}.`;
  const scheduleSummary = document.querySelector("#user-schedule-summary");
  if (scheduleSummary) scheduleSummary.textContent = userScheduleText();
  if (context) {
    const day = state.budgets[currentDayIndex()]?.day || days[new Date(`${state.operatingDate}T12:00:00`).getDay()] || "Today";
    const storeName = state.store.number === "DEMO"
      ? "Demonstration store"
      : state.store.name && state.store.name !== "Sample Store"
        ? `Store ${state.store.number} · ${state.store.name}`
        : `Store ${state.store.number}`;
    context.textContent = `${day} · ${storeName}`;
  }
}
function currentBudget() { return state.budgets[currentDayIndex()] || state.budgets[4]; }
function currentSchedule() { return state.weeklySchedule[currentDayIndex()] || []; }
function activeContests() {
  return state.contestsEnabled
    ? state.contests.filter((c) => c.active && state.fiscalWeek >= Number(c.startWeek || 1) && state.fiscalWeek <= Number(c.endWeek || 53))
    : [];
}
function contestWeekEntry(contest, key = weekKey()) {
  contest.weeklyResults ||= {};
  return contest.weeklyResults[key] || { result: 0, units: 0, transactions: 0, associateResults: {} };
}
function contestTotals(contest) {
  const entries = Object.entries(contest.weeklyResults || {}).filter(([key]) => {
    const [yearPart, weekPart] = key.split("-W");
    return Number(yearPart) === Number(state.fiscalYear) && Number(weekPart) >= Number(contest.startWeek || 1) && Number(weekPart) <= Math.min(Number(contest.endWeek || 53), Number(state.fiscalWeek));
  }).map(([, value]) => value);
  if (!entries.length) return { result: Number(contest.result || 0), units: Number(contest.units || 0), transactions: Number(contest.transactions || 0), associateResults: clone(contest.associateResults || {}) };
  const total = { result: 0, units: 0, transactions: 0, associateResults: {} };
  entries.forEach((entry) => {
    total.result += Number(entry.result || 0); total.units += Number(entry.units || 0); total.transactions += Number(entry.transactions || 0);
    Object.entries(entry.associateResults || {}).forEach(([name, value]) => { total.associateResults[name] = Number(total.associateResults[name] || 0) + Number(value || 0); });
  });
  return total;
}
function associateByName(name) { return state.associates.find((associate) => associate.name === name); }
function parseMinutes(time) {
  const normalized = normalizeTimeInput(time);
  if (!normalized) return 0;
  const [h, m] = normalized.split(":").map(Number);
  return h * 60 + m;
}
function shiftHours(shift) {
  let minutes = parseMinutes(shift.end) - parseMinutes(shift.start);
  if (minutes < 0) minutes += 1440;
  return Math.max(0, (minutes - Number(shift.breakMinutes || 0)) / 60);
}
function dayScheduledHours(index) { return (state.weeklySchedule[index] || []).reduce((sum, shift) => sum + shiftHours(shift), 0); }
function isPremiumEligible(associate) { return !overtimeExemptRoles.has(String(associate?.role || "").trim().toUpperCase()); }
function payrollBreakdown(entries) {
  const result = { totalHours: 0, regularHours: 0, overtimeHours: 0, holidayHours: 0, totalCost: 0, byDay: {}, byDayAssociate: {}, byAssociate: {}, byEntry: {} };
  const grouped = new Map();
  entries.forEach((entry, index) => {
    const normalized = { ...entry, entryIndex: entry.entryIndex ?? index, hours: Math.max(0, Number(entry.hours || 0)) };
    if (!grouped.has(normalized.associate)) grouped.set(normalized.associate, []);
    grouped.get(normalized.associate).push(normalized);
  });
  grouped.forEach((associateEntries, name) => {
    const associate = associateByName(name);
    const rate = Number(associate?.payRate || 0);
    const eligible = isPremiumEligible(associate);
    const totalHours = associateEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const nonHolidayHours = associateEntries.filter((entry) => !entry.isHoliday).reduce((sum, entry) => sum + entry.hours, 0);
    let overtimeRemaining = eligible ? Math.min(Math.max(0, totalHours - 40), nonHolidayHours) : 0;
    const entryPay = new Map();
    [...associateEntries].sort((a, b) => b.dayIndex - a.dayIndex || b.entryIndex - a.entryIndex).forEach((entry) => {
      const holidayHours = eligible && entry.isHoliday ? entry.hours : 0;
      const overtimeHours = !entry.isHoliday ? Math.min(entry.hours, overtimeRemaining) : 0;
      overtimeRemaining -= overtimeHours;
      const regularHours = entry.hours - holidayHours - overtimeHours;
      const multiplier = entry.isHoliday && eligible ? (Number(entry.holidayMultiplier) === 2 ? 2 : 1.5) : 1;
      const cost = rate * (regularHours + overtimeHours * 1.5 + holidayHours * multiplier);
      entryPay.set(entry.entryIndex, { hours: entry.hours, regularHours, overtimeHours, holidayHours, cost });
    });
    const summary = [...entryPay.values()].reduce((sum, item) => ({
      hours: sum.hours + item.hours, regularHours: sum.regularHours + item.regularHours,
      overtimeHours: sum.overtimeHours + item.overtimeHours, holidayHours: sum.holidayHours + item.holidayHours, cost: sum.cost + item.cost,
    }), { hours: 0, regularHours: 0, overtimeHours: 0, holidayHours: 0, cost: 0 });
    result.byAssociate[name] = summary;
    associateEntries.forEach((entry) => {
      const item = entryPay.get(entry.entryIndex);
      result.byEntry[entry.entryIndex] = item;
      result.byDay[entry.dayIndex] ||= { hours: 0, regularHours: 0, overtimeHours: 0, holidayHours: 0, cost: 0 };
      Object.keys(result.byDay[entry.dayIndex]).forEach((key) => { result.byDay[entry.dayIndex][key] += item[key]; });
      result.byDayAssociate[entry.dayIndex] ||= {};
      result.byDayAssociate[entry.dayIndex][name] ||= { hours: 0, regularHours: 0, overtimeHours: 0, holidayHours: 0, cost: 0 };
      Object.keys(result.byDayAssociate[entry.dayIndex][name]).forEach((key) => { result.byDayAssociate[entry.dayIndex][name][key] += item[key]; });
    });
    result.totalHours += summary.hours; result.regularHours += summary.regularHours;
    result.overtimeHours += summary.overtimeHours; result.holidayHours += summary.holidayHours; result.totalCost += summary.cost;
  });
  return result;
}
function scheduledPayroll() {
  let entryIndex = 0;
  const entries = state.weeklySchedule.flatMap((schedule, dayIndex) => schedule.map((shift) => ({
    entryIndex: entryIndex++, associate: shift.associate, dayIndex, hours: shiftHours(shift),
    isHoliday: Boolean(state.budgets[dayIndex]?.isHoliday), holidayMultiplier: state.budgets[dayIndex]?.holidayMultiplier,
  })));
  return payrollBreakdown(entries);
}
function actualPayroll(currentDraft = null) {
  const hoursByDate = clone(state.actualHoursByDate || {});
  if (currentDraft) hoursByDate[state.operatingDate] = clone(currentDraft);
  const entries = [];
  state.budgets.forEach((budget, dayIndex) => {
    Object.entries(hoursByDate[budget.date] || {}).forEach(([associate, hours]) => entries.push({
      associate, dayIndex, hours, isHoliday: Boolean(budget.isHoliday), holidayMultiplier: budget.holidayMultiplier,
    }));
  });
  return payrollBreakdown(entries);
}
function shiftCost(shift) {
  const dayIndex = state.weeklySchedule.findIndex((schedule) => schedule.includes(shift));
  const shiftIndex = dayIndex >= 0 ? state.weeklySchedule[dayIndex].indexOf(shift) : -1;
  if (dayIndex < 0 || shiftIndex < 0) return shiftHours(shift) * Number(associateByName(shift.associate)?.payRate || 0);
  let entryIndex = 0;
  for (let index = 0; index < dayIndex; index += 1) entryIndex += state.weeklySchedule[index].length;
  return Number(scheduledPayroll().byEntry[entryIndex + shiftIndex]?.cost || 0);
}
function dayScheduledCost(index) { return Number(scheduledPayroll().byDay[index]?.cost || 0); }
function actualHoursTotal() { return Object.values(state.results.actualHours || {}).reduce((sum, value) => sum + Number(value || 0), 0); }
function actualCostTotal() { return Number(actualPayroll().byDay[currentDayIndex()]?.cost || 0); }

function calculations() {
  const index = currentDayIndex();
  const sales = Number(state.results.sales || 0);
  const wtdSales = Number(state.beforeToday.sales || 0) + sales;
  const wtdBudget = state.budgets.slice(0, index + 1).reduce((sum, row) => sum + Number(row.budget || 0), 0);
  const wtdLastYear = state.budgets.slice(0, index + 1).reduce((sum, row) => sum + Number(row.lastYear || 0), 0);
  const received = Number(state.beforeToday.receivedUnits || 0) + Number(state.results.receivedUnits || 0);
  const nonRetail = Number(state.beforeToday.nonRetailUnits || 0) + Number(state.results.nonRetailUnits || 0);
  const shelvable = Math.max(0, received - nonRetail);
  const usedUnitsSold = Number(state.beforeToday.usedUnitsSold || 0) + Number(state.results.usedUnitsSold || 0);
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
    lyVariance: wtdSales - wtdLastYear, received, nonRetail, shelvable, usedUnitsSold,
    buybackRatio: safeDivide(shelvable, usedUnitsSold),
    opportunityLoyalty: safeDivide(newSignups, blankTransactions) * 100,
    transactionLoyalty: safeDivide(namedTransactions, totalTransactions) * 100,
    scheduledHours, scheduledCost, actualHours, actualCost, budget: currentBudget(),
  };
}

function formatContestResult(contest, value = contestTotals(contest).result) {
  return contest.metric === "dollars" ? money(value) : `${number(value)} units`;
}

function workflowForToday() {
  state.dailyWorkflow ||= {};
  state.dailyWorkflow[state.operatingDate] ||= {};
  return state.dailyWorkflow[state.operatingDate];
}

function hasTodayResults() {
  const workflow = workflowForToday();
  return Boolean(workflow.resultsUpdatedAt) || [
    state.results.sales, state.results.receivedUnits, state.results.usedUnitsSold,
    state.results.newSignups, state.results.totalTransactions,
  ].some((value) => Number(value || 0) > 0);
}

function timestampText(value, fallback = "Saved previously") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit",
  }).format(date);
}

function renderGuidedPhases() {
  const workflow = workflowForToday();
  const complete = {
    start: Boolean(workflow.startReviewedAt),
    run: Boolean(workflow.middayGeneratedAt),
    close: Boolean(workflow.nightlyGeneratedAt),
  };
  const current = !complete.start ? "start" : !complete.run ? "run" : !complete.close ? "close" : "close";
  if (openPhase === undefined || (openPhase && !document.querySelector(`[data-phase="${openPhase}"]`))) openPhase = current;
  document.querySelectorAll(".phase-card").forEach((card) => {
    const phase = card.dataset.phase;
    const isOpen = phase === openPhase;
    const isComplete = complete[phase];
    const isCurrent = phase === current && !isComplete;
    card.classList.toggle("open", isOpen);
    card.classList.toggle("complete", isComplete);
    card.classList.toggle("active-step", isCurrent);
    card.querySelector(".phase-toggle").setAttribute("aria-expanded", String(isOpen));
    const icon = card.querySelector(".status-icon");
    icon.className = `status-icon ${isComplete ? "complete" : isCurrent ? "" : "waiting"}`;
    icon.textContent = isComplete ? "✓" : "";
    card.querySelector("em").textContent = isComplete ? "Complete" : isCurrent ? "Now" : "Later";
  });
}

function renderToday() {
  refreshTodayHeader();
  renderFact();
  const calc = calculations();
  const contests = activeContests();
  const metrics = [
    { label: "WTD sales", value: money(calc.wtdSales), meta: `${varianceText(calc.wtdVariance)} to budget`, detail: `${varianceText(calc.lyVariance)} to LY`, tone: varianceClass(calc.wtdVariance), highlight: true },
    { label: "Buyback ratio", value: ratio(calc.buybackRatio), meta: `Goal ${ratio(state.goals.buybackRatio)}`, detail: Number.isFinite(calc.buybackRatio) && calc.buybackRatio >= state.goals.buybackRatio ? "On goal" : "Below goal", tone: Number.isFinite(calc.buybackRatio) && calc.buybackRatio >= state.goals.buybackRatio ? "positive" : "negative" },
    { label: "Loyalty Opportunity", value: percent(calc.opportunityLoyalty), meta: `Goal ${percent(state.goals.loyalty)}`, detail: "Sign-ups ÷ blanks", tone: calc.opportunityLoyalty >= state.goals.loyalty ? "positive" : "negative" },
    ...(state.payrollToolsActive && access.canViewPayroll ? [{ label: "Payroll cost", value: money(calc.actualCost), meta: `Budget ${money(calc.budget.payrollBudget)}`, detail: `${money(Math.abs(calc.budget.payrollBudget - calc.actualCost))} ${calc.actualCost <= calc.budget.payrollBudget ? "available" : "over"}`, tone: calc.actualCost <= calc.budget.payrollBudget ? "positive" : "negative" }] : []),
    ...contests.slice(0, 2).map((contest) => {
      const total = contestTotals(contest);
      return { label: contest.name, value: formatContestResult(contest, total.result), meta: `Goal ${formatContestResult(contest, contest.goal)}`, detail: `${percent(safeDivide(total.result, contest.goal) * 100)} complete`, tone: "neutral" };
    }),
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
  const userShifts = shiftsForSignedInUser();
  const shiftText = userShifts.length
    ? userShifts.map((shift) => `${timeText(shift.start)}–${timeText(shift.end)}${shift.position ? ` · ${shift.position}` : ""}`).join(", ")
    : signedInUserName() ? "You aren’t listed on today’s schedule" : "See today’s schedule and assignment";
  document.querySelector("#glance-shift").textContent = shiftText;
  document.querySelector("#glance-team").textContent = `${currentSchedule().length} scheduled · assignments ready`;
  const dailyGoal = Number(calc.budget.budget || 0);
  const dailyProgress = dailyGoal ? Math.min(999, Math.round((calc.sales / dailyGoal) * 100)) : 0;
  document.querySelector("#glance-sales-goal").textContent = `${money(dailyGoal)} · ${dailyProgress}% complete`;
  const openCommunications = access.canViewCommunications
    ? state.communications.filter((entry) => entry.status !== "Resolved").length
    : null;
  document.querySelector("#glance-communication").textContent = openCommunications === null
    ? "Available with Communication Log access"
    : `${openCommunications} open ${openCommunications === 1 ? "note" : "notes"}`;

  const workflow = workflowForToday();
  const hasResults = hasTodayResults();
  const nextButton = document.querySelector("#next-action-button");
  const nextAction = !workflow.startReviewedAt ? {
    title: "Review today’s plan", copy: "Check the latest results, confirm the schedule, and align the team’s focus before the shift gets moving.",
    status: "Start here", button: "Review the plan", phase: "start",
  } : !hasResults ? {
    title: "Enter today’s results", copy: "Add the latest sales, loyalty, buyback, and staffing numbers. Your reports will use them automatically.",
    status: "Ready now", button: "Enter results", go: "results", phase: "run",
  } : !workflow.middayGeneratedAt ? {
    title: "Complete the midday check-in", copy: "The latest numbers are ready. Add the floor update and send the manager check-in.",
    status: `${dailyProgress}% of today’s sales goal`, button: "Complete check-in", go: "midday", phase: "run",
  } : !workflow.nightlyGeneratedAt ? {
    title: "Close the shift", copy: "Add the closing story, leave tomorrow’s handoff, and generate the nightly report.",
    status: `Midday sent at ${timestampText(workflow.middayGeneratedAt)}`, button: "Complete nightly report", go: "nightly", phase: "close",
  } : {
    title: "Today is complete", copy: "The plan was reviewed and both manager reports are saved. Everything is ready for tomorrow.",
    status: `Closed at ${timestampText(workflow.nightlyGeneratedAt)}`, button: "Review nightly report", go: "nightly", phase: "close",
  };
  document.querySelector("#next-action-title").textContent = nextAction.title;
  document.querySelector("#next-action-copy").textContent = nextAction.copy;
  document.querySelector("#next-action-status").textContent = nextAction.status;
  nextButton.textContent = nextAction.button;
  if (nextAction.go) nextButton.dataset.go = nextAction.go;
  else delete nextButton.dataset.go;
  nextButton.dataset.openPhase = nextAction.phase;
  renderGuidedPhases();
  const middayStatus = document.querySelector("#midday-results-status");
  middayStatus.classList.toggle("has-results", hasResults);
  middayStatus.innerHTML = hasResults
    ? `Results are ready · ${money(calc.sales)} sales · ${dailyProgress}% of goal <strong>Update results</strong>`
    : `Today’s results haven’t been entered yet. <strong>Enter results</strong>`;
  document.querySelector("#today-schedule").innerHTML = currentSchedule().map((shift) => `
    <tr><td><div class="associate-name"><span class="avatar">${esc(initials(shift.associate))}</span>${esc(shift.associate)}</div></td>
    <td>${esc(timeText(shift.start))}–${esc(timeText(shift.end))}</td><td><strong class="position-text">${esc(shift.position)}</strong></td>
    <td>${esc(shift.breakAt || "—")}</td><td>${esc(shift.assignment)}</td></tr>`).join("");
  document.querySelector("#today-priorities").innerHTML = state.priorities.map((item, index) => `
    <div class="priority-item"><span class="priority-number">${index + 1}</span><div><strong>${esc(item)}</strong><span>${index === 0 ? "Every associate · all day" : "Assigned during shift huddle"}</span></div></div>`).join("");
  const container = document.querySelector("#today-contests");
  const panel = container.closest(".panel");
  panel.hidden = contests.length === 0;
  container.innerHTML = contests.map((contest) => {
    const total = contestTotals(contest);
    return `<div class="contest-item"><div><strong>${esc(contest.name)}</strong><span>${esc(formatContestResult(contest, total.result))} of ${esc(formatContestResult(contest, contest.goal))}</span>
    <div class="progress"><span style="width:${Math.min(100, safeDivide(total.result, contest.goal) * 100 || 0)}%"></span></div></div>
    <span class="contest-score">${percent(safeDivide(total.result, contest.goal) * 100)}</span></div>`;
  }).join("");
}

function renderSetup() {
  document.querySelector("#store-number").value = state.store.number;
  document.querySelector("#store-name").value = state.store.name;
  document.querySelector("#gm-name").value = state.store.gm;
  document.querySelector("#week-start").value = state.store.weekStart;
  document.querySelector("#payroll-tools-enabled").checked = state.payrollToolsActive;
  document.querySelector("#keyboard-shortcuts-enabled").checked = state.keyboardShortcutsActive;
  document.querySelector("#associate-rows").innerHTML = state.associates.map((associate, index) => `
    <tr data-associate-index="${index}">
      <td><input class="inline-input associate-field" data-field="name" value="${esc(associate.name)}" aria-label="Associate name"></td>
      <td><input class="inline-input associate-field" data-field="id" value="${esc(associate.id)}" aria-label="Employee ID"></td>
      <td><input class="inline-input associate-field" data-field="loginName" value="${esc(associate.loginName || "")}" placeholder="WordPress username" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="WordPress login name"></td>
      <td><select class="inline-input associate-field" data-field="role" aria-label="Role">${roles.map((role) => `<option ${selected(role, associate.role)}>${role}</option>`).join("")}</select></td>
      <td class="payroll-tool"><input class="inline-input associate-field pay-rate-input" data-field="payRate" type="number" step=".01" min="0" value="${associate.payRate}" aria-label="Hourly pay rate"></td>
      <td><button class="remove-button remove-associate" aria-label="Remove ${esc(associate.name)}">×</button></td>
    </tr>`).join("");
  document.querySelector("#contests-enabled").checked = state.contestsEnabled;
  document.querySelector("#contest-setup-rows").innerHTML = state.contests.map((contest, index) => `
    <div class="contest-setup-row" data-contest-index="${index}">
      <label class="toggle compact"><input class="contest-field" data-field="active" type="checkbox" ${checked(contest.active)}><span></span> Active</label>
      <label>Contest name<input class="contest-field" data-field="name" value="${esc(contest.name)}"></label>
      <label>Primary measure<select class="contest-field" data-field="metric"><option value="dollars" ${selected("dollars", contest.metric)}>Dollars</option><option value="units" ${selected("units", contest.metric)}>Units</option></select></label>
      <label>Goal<input class="contest-field" data-field="goal" type="number" min="0" step=".01" value="${contest.goal}"></label>
      <label>Start week<input class="contest-field" data-field="startWeek" type="number" min="1" max="53" value="${contest.startWeek || state.fiscalWeek}"></label>
      <label>End week<input class="contest-field" data-field="endWeek" type="number" min="1" max="53" value="${contest.endWeek || state.fiscalWeek}"></label>
    </div>`).join("");
  document.querySelector("#contest-setup-rows").classList.toggle("disabled-section", !state.contestsEnabled);
}

function renderGoals() {
  document.querySelector("#planning-week-label").textContent = `FY${String(state.fiscalYear).slice(-2)} · Fiscal Week ${state.fiscalWeek}`;
  document.querySelector("#budget-rows").innerHTML = state.budgets.map((row, index) => `
    <tr data-budget-index="${index}"><td><strong>${esc(row.day)}</strong></td>
      <td><input class="inline-input budget-field" data-field="date" type="date" value="${row.date}"></td>
      <td><input class="inline-input budget-field" data-field="budget" type="number" min="0" value="${row.budget}"></td>
      <td><input class="inline-input budget-field" data-field="lastYear" type="number" min="0" value="${row.lastYear}"></td>
      <td><input class="inline-input budget-field" data-field="buybackGoal" type="number" min="0" value="${row.buybackGoal}"></td>
      <td><input class="inline-input budget-field" data-field="lyBuybackUnits" type="number" min="0" value="${row.lyBuybackUnits}"></td>
      <td><input class="inline-input budget-field" data-field="lyBuybackRatio" type="number" min="0" step=".001" value="${row.lyBuybackRatio}"></td>
      <td class="payroll-tool"><input class="inline-input budget-field" data-field="payrollBudget" type="number" min="0" step=".01" value="${row.payrollBudget}"></td>
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
  document.querySelector("#weekly-overview-head").innerHTML = `<tr><th>Associate</th>${state.budgets.map((row) => `<th class="${row.isHoliday ? "holiday-column" : ""}">${row.day.slice(0, 3)}${row.isHoliday ? '<em>Holiday</em>' : ""}<br><span>${dateText(row.date)}</span></th>`).join("")}<th>Week</th></tr>`;
  const scheduled = scheduledPayroll();
  document.querySelector("#weekly-overview-body").innerHTML = state.associates.map((associate) => {
    let total = 0;
    const cells = state.weeklySchedule.map((schedule) => {
      const shifts = schedule.filter((shift) => shift.associate === associate.name);
      const hours = shifts.reduce((sum, shift) => sum + shiftHours(shift), 0);
      total += hours;
      return `<td>${shifts.length ? shifts.map((shift) => `<span>${timeText(shift.start).replace(":00", "")}–${timeText(shift.end).replace(":00", "")}</span>`).join("") : "—"}</td>`;
    }).join("");
    const pay = scheduled.byAssociate[associate.name] || { overtimeHours: 0, holidayHours: 0 };
    return `<tr><td><strong>${esc(associate.name)}</strong><small>${esc(associate.role)}${pay.overtimeHours ? ` · ${number(pay.overtimeHours, 1)} OT` : ""}${pay.holidayHours ? ` · ${number(pay.holidayHours, 1)} holiday` : ""}</small></td>${cells}<td><strong class="${pay.overtimeHours > 0 ? "negative" : ""}">${number(total, 1)}h</strong></td></tr>`;
  }).join("");
  const weeklyHours = state.weeklySchedule.reduce((sum, _, i) => sum + dayScheduledHours(i), 0);
  const weeklyCost = scheduled.totalCost;
  const weeklyBudget = state.budgets.reduce((sum, row) => sum + Number(row.payrollBudget || 0), 0);
  document.querySelector("#weekly-overview-foot").innerHTML = state.payrollToolsActive
    ? `<tr><th>Daily cost</th>${state.budgets.map((_, i) => `<th>${money(dayScheduledCost(i))}</th>`).join("")}<th>${money(weeklyCost)}</th></tr>`
    : "";
  document.querySelector("#weekly-payroll-summary").innerHTML = `<span>${number(weeklyHours, 1)}h total · ${number(scheduled.overtimeHours, 1)}h OT · ${number(scheduled.holidayHours, 1)}h holiday</span><strong>${money(weeklyCost)} / ${money(weeklyBudget)}</strong><small class="${weeklyCost <= weeklyBudget ? "positive" : "negative"}">${money(Math.abs(weeklyBudget - weeklyCost))} ${weeklyCost <= weeklyBudget ? "available" : "over budget"}</small>`;
}

function renderSchedule() {
  renderWeekOverview();
  const dayIndex = state.selectedScheduleDay;
  const schedule = state.weeklySchedule[dayIndex] || [];
  const dayPlan = state.budgets[dayIndex];
  document.querySelector("#schedule-day-label").textContent = `${dayPlan.day} · ${dateText(dayPlan.date, { month: "long", day: "numeric" })}${dayPlan.isHoliday && dayPlan.holidayName ? ` · ${dayPlan.holidayName}` : ""}`;
  document.querySelector("#schedule-holiday").checked = Boolean(dayPlan.isHoliday);
  document.querySelector("#holiday-name").value = dayPlan.holidayName || "";
  document.querySelector("#holiday-multiplier").value = String(Number(dayPlan.holidayMultiplier) === 2 ? 2 : 1.5);
  document.querySelector("#holiday-details").hidden = !dayPlan.isHoliday;
  document.querySelector("#shift-rows").innerHTML = schedule.map((shift, index) => `
    <div class="shift-row" data-shift-index="${index}">
      <label><span>Associate</span><select class="shift-field" data-field="associate">${state.associates.map((a) => `<option ${selected(a.name, shift.associate)}>${esc(a.name)}</option>`).join("")}</select></label>
      <label><span>Start</span><input class="shift-field shift-time-field" data-field="start" inputmode="text" placeholder="9:00 AM or 0900" value="${esc(shift.start)}"></label>
      <label><span>End</span><input class="shift-field shift-time-field" data-field="end" inputmode="text" placeholder="5:00 PM or 1700" value="${esc(shift.end)}"></label>
      <label><span>Position</span><select class="shift-field" data-field="position">${positions.map((p) => `<option ${selected(p, shift.position)}>${p}</option>`).join("")}</select></label>
      <label><span>Break</span><div class="break-fields"><input class="shift-field" data-field="breakAt" value="${esc(shift.breakAt || "—")}" aria-label="Break time"><input class="shift-field" data-field="breakMinutes" type="number" min="0" step="15" value="${shift.breakMinutes || 0}" aria-label="Unpaid break minutes"></div></label>
      <label><span>Assignment</span><input class="shift-field" data-field="assignment" value="${esc(shift.assignment)}"></label>
      <output>${number(shiftHours(shift), 2)}h</output><output class="payroll-tool">${money(shiftCost(shift), 2)}</output>
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
  const registerCoverage = schedule.some((shift) => shift.position === "Register Area");
  if (!registerCoverage) warnings.push("No register assigned");
  state.associates.forEach((associate) => {
    const pay = scheduledPayroll().byAssociate[associate.name];
    if (pay?.overtimeHours > 0) warnings.push(`${associate.name}: ${number(pay.overtimeHours, 1)}h overtime`);
  });
  document.querySelector("#schedule-warnings").innerHTML = warnings.length
    ? warnings.map((warning) => `<span>⚠ ${esc(warning)}</span>`).join("")
    : `<span class="positive">✓ No schedule warnings</span>`;
}

function draftResults() {
  const receivedUnits = Number(document.querySelector("#result-received-units").value || 0);
  const nonRetailUnits = Number(document.querySelector("#result-nonretail-units").value || 0);
  return {
    sales: Number(document.querySelector("#result-sales").value || 0),
    receivedUnits,
    shelvableUnits: Math.max(0, receivedUnits - nonRetailUnits),
    nonRetailUnits,
    usedUnitsSold: Number(document.querySelector("#result-used-units-sold").value || 0),
    newSignups: Number(document.querySelector("#result-new-signups").value || 0),
    blankTransactions: Number(document.querySelector("#result-blank-transactions").value || 0),
    totalTransactions: Number(document.querySelector("#result-total-transactions").value || 0),
    actualHours: Object.fromEntries([...document.querySelectorAll(".actual-hours-field")].map((input) => [input.dataset.associate, Number(input.value || 0)])),
  };
}

function renderResults() {
  const fields = {
    "#result-sales": "sales", "#result-received-units": "receivedUnits", "#result-shelvable-units": "shelvableUnits",
    "#result-nonretail-units": "nonRetailUnits", "#result-used-units-sold": "usedUnitsSold",
    "#result-new-signups": "newSignups", "#result-blank-transactions": "blankTransactions", "#result-total-transactions": "totalTransactions",
  };
  Object.entries(fields).forEach(([selector, key]) => { document.querySelector(selector).value = state.results[key] || 0; });
  const workflow = workflowForToday();
  const updatedBy = workflow.resultsUpdatedBy ? ` by ${workflow.resultsUpdatedBy}` : "";
  document.querySelector("#results-updated-line").textContent = workflow.resultsUpdatedAt
    ? `Last saved at ${timestampText(workflow.resultsUpdatedAt)}${updatedBy}. Midday and Nightly will use these numbers automatically.`
    : hasTodayResults() ? "Existing results are loaded. Save them to add a current timestamp." : "No results have been saved for this day.";
  const schedule = currentSchedule();
  const actual = actualPayroll(state.results.actualHours || {});
  document.querySelector("#payroll-results-summary").innerHTML = `
    <div class="payroll-summary-head"><span>Associate</span><span>Scheduled</span><span>Worked</span><span>Actual cost</span></div>
    ${schedule.map((shift) => {
      const worked = Number(state.results.actualHours?.[shift.associate] ?? shiftHours(shift));
      return `<label class="payroll-person"><strong>${esc(shift.associate)}</strong><span>${number(shiftHours(shift), 2)}h</span>
        <input class="actual-hours-field" data-associate="${esc(shift.associate)}" type="number" min="0" step=".25" value="${worked}" aria-label="${esc(shift.associate)} worked hours">
        <output>${money(actual.byDayAssociate[currentDayIndex()]?.[shift.associate]?.cost || 0, 2)}</output></label>`;
    }).join("")}`;
  renderContestResults();
  updateResultCallouts();
}

function renderContestResults() {
  ensureAssociateDaily();
  const contests = activeContests();
  document.querySelector("#contest-results-panel").hidden = false;
  const contestHeaders = contests.map((contest) => contest.id === "bookDrive"
    ? `<th>Book Drive $</th><th>Donated units</th><th>Donation txns</th>`
    : `<th>${esc(contest.name)} units</th>`).join("");
  document.querySelector("#associate-daily-head").innerHTML = `<tr><th>Associate</th><th>BB units received</th><th>BB non-retail</th>${contestHeaders}</tr>`;
  document.querySelector("#associate-daily-body").innerHTML = state.associates.map((associate) => {
    const entry = state.associateDaily[associate.name];
    const contestCells = contests.map((contest) => {
      const values = entry.contests[contest.id] || { result: 0, units: 0, transactions: 0 };
      if (contest.id === "bookDrive") return `
        <td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-contest="${contest.id}" data-field="result" type="number" min="0" step=".01" value="${values.result || 0}"></td>
        <td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-contest="${contest.id}" data-field="units" type="number" min="0" value="${values.units || 0}"></td>
        <td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-contest="${contest.id}" data-field="transactions" type="number" min="0" value="${values.transactions || 0}"></td>`;
      return `<td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-contest="${contest.id}" data-field="result" type="number" min="0" value="${values.result || 0}"></td>`;
    }).join("");
    return `<tr><td><strong>${esc(associate.name)}</strong></td>
      <td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-field="buybackReceived" type="number" min="0" value="${entry.buybackReceived || 0}"></td>
      <td><input class="daily-associate-field" data-associate="${esc(associate.name)}" data-field="buybackNonRetail" type="number" min="0" value="${entry.buybackNonRetail || 0}"></td>${contestCells}</tr>`;
  }).join("");
  const columnCount = 3 + contests.reduce((sum, contest) => sum + (contest.id === "bookDrive" ? 3 : 1), 0);
  document.querySelector("#associate-daily-foot").innerHTML = `<tr><th>Store totals</th>${Array.from({ length: columnCount - 1 }, () => "<th>—</th>").join("")}</tr>`;
  updateAssociateDailyTotals();
  document.querySelector("#contest-cumulative-summary").innerHTML = contests.map((contest) => {
    const total = contestTotals(contest);
    return `<div><span>${esc(contest.name)} · Weeks ${contest.startWeek}–${contest.endWeek}</span><strong>${esc(formatContestResult(contest, total.result))} / ${esc(formatContestResult(contest, contest.goal))}</strong><small>${percent(safeDivide(total.result, contest.goal) * 100)} contest-to-date${contest.id === "bookDrive" ? ` · ${number(total.units)} units · avg ${total.transactions ? money(total.result / total.transactions, 2) : "—"}` : ""}</small></div>`;
  }).join("");
}

function updateAssociateDailyTotals() {
  const rows = [...document.querySelectorAll("#associate-daily-body tr")];
  const fields = [...document.querySelectorAll("#associate-daily-head th")].slice(1);
  const totals = [];
  for (let column = 0; column < fields.length; column += 1) {
    totals.push(rows.reduce((sum, row) => sum + Number(row.querySelectorAll("input")[column]?.value || 0), 0));
  }
  document.querySelector("#associate-daily-foot").innerHTML = `<tr><th>Store totals<small>${number(totals[0] || 0)} total buyback units received</small></th>${totals.map((value, i) => `<th>${fields[i].textContent.includes("$") ? money(value, 2) : number(value)}</th>`).join("")}</tr>`;
  document.querySelector("#result-received-units").value = totals[0] || 0;
  document.querySelector("#result-nonretail-units").value = totals[1] || 0;
  document.querySelector("#result-shelvable-units").value = Math.max(0, (totals[0] || 0) - (totals[1] || 0));
}

function updateResultCallouts() {
  const result = draftResults();
  const budget = Number(currentBudget().budget || 0);
  const salesVariance = result.sales - budget;
  const buyback = safeDivide(result.receivedUnits - result.nonRetailUnits, result.usedUnitsSold);
  const named = Math.max(0, result.totalTransactions - result.blankTransactions);
  const opportunity = safeDivide(result.newSignups, result.blankTransactions) * 100;
  const transaction = safeDivide(named, result.totalTransactions) * 100;
  document.querySelector("#result-named-transactions").value = named;
  const scheduledHours = dayScheduledHours(currentDayIndex());
  const scheduledCost = dayScheduledCost(currentDayIndex());
  const actualHours = Object.values(result.actualHours).reduce((sum, v) => sum + v, 0);
  const actual = actualPayroll(result.actualHours);
  const actualCost = Number(actual.byDay[currentDayIndex()]?.cost || 0);
  document.querySelector("#sales-callout").textContent = `${varianceText(salesVariance)} ${salesVariance >= 0 ? "above" : "below"} today’s budget of ${money(budget)}.`;
  document.querySelector("#buyback-callout").textContent = `Today’s ratio: ${ratio(buyback)} · ${number(result.receivedUnits - result.nonRetailUnits)} shelvable ÷ ${number(result.usedUnitsSold)} used units sold.`;
  document.querySelector("#loyalty-callout").innerHTML = `Loyalty opportunity: <strong>${percent(opportunity)}</strong> · Transaction loyalty: <strong>${percent(transaction)}</strong>`;
  document.querySelector("#payroll-callout").innerHTML = `
    <strong>${number(scheduledHours, 2)}h scheduled / ${number(actualHours, 2)}h worked</strong><br>
    ${money(scheduledCost, 2)} scheduled cost · ${money(actualCost, 2)} actual cost ·
    <span class="${actualCost <= currentBudget().payrollBudget ? "positive" : "negative"}">${money(Math.abs(currentBudget().payrollBudget - actualCost), 2)} ${actualCost <= currentBudget().payrollBudget ? "available" : "over budget"}</span><br>
    <small>Week: ${number(actual.regularHours, 2)} regular · ${number(actual.overtimeHours, 2)} overtime at 1.5× · ${number(actual.holidayHours, 2)} holiday</small>`;
}

function renderAgenda() {
  const calc = calculations();
  const date = new Date(`${state.operatingDate}T12:00:00`);
  document.querySelector("#agenda-date").textContent = `${new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)}\n${dateText(state.operatingDate, { month: "long", day: "numeric", year: "numeric" })}`;
  const metrics = [
    ["Today’s budget", money(calc.budget.budget)], ["WTD sales", money(calc.wtdSales)],
    ["To budget", varianceText(calc.wtdVariance)], ["Loyalty Opportunity", percent(calc.opportunityLoyalty)],
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
    const total = contestTotals(contest);
    const extra = contest.id === "bookDrive" ? ` · ${number(total.units)} units · Avg ${total.transactions ? money(total.result / total.transactions, 2) : "—"}` : "";
    return `<div class="agenda-contest-line"><strong>${esc(contest.name)}</strong><span>${esc(formatContestResult(contest, total.result))} / ${esc(formatContestResult(contest, contest.goal))}${esc(extra)}</span></div>`;
  }).join("");
  document.querySelector("#agenda-message").textContent = state.teamMessage;
}

function renderNightly() {
  const managers = state.associates.filter((a) => ["GM", "ASM", "MOD"].includes(a.role)).map((a) => a.name);
  document.querySelector("#nightly-mod").innerHTML = managers.map((name) => `<option ${selected(name, state.nightly.mod)}>${esc(name)}</option>`).join("");
  ["wins", "opportunities", "followup", "handoff"].forEach((key) => { document.querySelector(`#nightly-${key}`).value = state.nightly[key]; });
}

function renderMidday() {
  const workflow = workflowForToday();
  document.querySelector("#midday-floor-update").value = workflow.middayFloorUpdate || "";
}

function renderFiscalControls() {
  const yearSelect = document.querySelector("#fiscal-year");
  const weekSelect = document.querySelector("#fiscal-week");
  yearSelect.innerHTML = [2026, 2027, 2028, 2029].map((year) => `<option value="${year}" ${selected(year, state.fiscalYear)}>FY${String(year).slice(-2)}</option>`).join("");
  weekSelect.innerHTML = Array.from({ length: 53 }, (_, index) => index + 1).map((week) => `<option value="${week}" ${selected(week, state.fiscalWeek)}>Week ${week}</option>`).join("");
  const first = state.budgets[0]?.date; const last = state.budgets[6]?.date;
  const dateInput = document.querySelector("#operating-date");
  dateInput.min = first; dateInput.max = last; dateInput.value = state.operatingDate;
}

function renderCommunications() {
  const search = (document.querySelector("#communication-search")?.value || "").toLowerCase();
  const status = document.querySelector("#communication-status-filter")?.value || "";
  const category = document.querySelector("#communication-category-filter")?.value || "";
  const entries = state.communications.filter((entry) =>
    (!search || Object.values(entry).join(" ").toLowerCase().includes(search)) &&
    (!status || entry.status === status) && (!category || entry.category === category));
  document.querySelector("#communication-rows").innerHTML = entries.map((entry, index) => `
    <tr data-communication-index="${state.communications.indexOf(entry)}">
      <td><input class="communication-field" data-field="dateTime" type="datetime-local" value="${esc(entry.dateTime)}"></td>
      <td><select class="communication-field" data-field="associate"><option value="">Store / general</option>${state.associates.map((a) => `<option ${selected(a.name, entry.associate)}>${esc(a.name)}</option>`).join("")}</select></td>
      <td><select class="communication-field" data-field="manager">${state.associates.filter((a) => ["GM", "ASM", "MOD"].includes(a.role)).map((a) => `<option ${selected(a.name, entry.manager)}>${esc(a.name)}</option>`).join("")}</select></td>
      <td><select class="communication-field" data-field="category">${["Attendance", "Performance", "Customer", "LP", "Recognition", "General"].map((value) => `<option ${selected(value, entry.category)}>${value}</option>`).join("")}</select></td>
      <td><textarea class="communication-field" data-field="notes" rows="2">${esc(entry.notes)}</textarea></td>
      <td><input class="communication-field" data-field="followup" type="date" value="${esc(entry.followup)}"></td>
      <td><div class="log-status"><select class="communication-field" data-field="status">${["Open", "Follow-up", "Resolved"].map((value) => `<option ${selected(value, entry.status)}>${value}</option>`).join("")}</select><button class="remove-button remove-communication" aria-label="Remove entry">×</button></div></td>
    </tr>`).join("") || `<tr><td colspan="7">No communication entries match these filters.</td></tr>`;
}

function renderSnapshots() {
  document.querySelector("#snapshot-list").innerHTML = state.reportSnapshots.length
    ? state.reportSnapshots.slice().reverse().map((snapshot) => `<article class="snapshot-item"><div><strong>${esc(snapshot.title)}</strong><span>${esc(snapshot.created)}</span></div><button type="button" class="text-button load-snapshot" data-snapshot-id="${snapshot.id}">View →</button></article>`).join("")
    : `<p class="empty-state">No saved period snapshots yet.</p>`;
  const isEndOfDay = document.querySelector("#period-report-type").value === "End of Day";
  document.querySelector("#period-start").value ||= isEndOfDay ? state.operatingDate : state.budgets[0].date;
  document.querySelector("#period-end").value ||= isEndOfDay ? state.operatingDate : state.budgets[6].date;
}

function reportContestLines() {
  return activeContests().map((contest) => {
    const total = contestTotals(contest);
    return `${contest.name}: ${formatContestResult(contest, total.result)} of ${formatContestResult(contest, contest.goal)} (${percent(safeDivide(total.result, contest.goal) * 100)})`;
  });
}

function periodWeekEntries(start, end) {
  snapshotCurrentWeek();
  return Object.entries(state.weeks || {}).filter(([, week]) =>
    (week.budgets || []).some((row) => row.date && row.date >= start && row.date <= end));
}

function periodAssociateLines(start, end) {
  return periodAssociateResults(start, end).map(({ name, received, nonRetail, shelvable, contests }) => {
    const contestText = Object.entries(contests).map(([contest, result]) => `${contest} ${number(result, 2)}`).join(" · ");
    return `• ${name}: ${number(received)} received · ${number(nonRetail)} no-retail · ${number(shelvable)} shelvable${contestText ? ` · ${contestText}` : ""}`;
  });
}

function periodAssociateResults(start, end) {
  const totals = Object.fromEntries(state.associates.map((associate) => [associate.name, {
    received: 0, nonRetail: 0, contests: {},
  }]));
  periodWeekEntries(start, end).forEach(([key, week]) => {
    Object.entries(week.associateDaily || {}).forEach(([name, entry]) => {
      totals[name] ||= { received: 0, nonRetail: 0, contests: {} };
      totals[name].received += Number(entry.buybackReceived || 0);
      totals[name].nonRetail += Number(entry.buybackNonRetail || 0);
    });
    state.contests.forEach((contest) => {
      Object.entries(contest.weeklyResults?.[key]?.associateResults || {}).forEach(([name, value]) => {
        totals[name] ||= { received: 0, nonRetail: 0, contests: {} };
        totals[name].contests[contest.name] = Number(totals[name].contests[contest.name] || 0) + Number(value || 0);
      });
    });
  });
  return Object.entries(totals)
    .filter(([, value]) => value.received || value.nonRetail || Object.keys(value.contests).length)
    .sort((a, b) => b[1].received - a[1].received)
    .map(([name, value]) => ({ name, ...value, shelvable: Math.max(0, value.received - value.nonRetail) }));
}

function generateMiddayReport() {
  const calc = calculations();
  const time = document.querySelector("#midday-time").value || "12:00";
  const floorUpdate = document.querySelector("#midday-floor-update").value.trim();
  const report = [
    `STORE ${state.store.number} — MIDDAY REPORT — ${timeText(time)}`,
    `${dateText(state.operatingDate, { weekday: "long", month: "long", day: "numeric" })} · FY${String(state.fiscalYear).slice(-2)} Week ${state.fiscalWeek}`, "",
    `Sales: ${money(calc.sales)} / ${money(calc.budget.budget)} daily budget (${varianceText(calc.salesVariance)})`,
    `WTD Sales: ${money(calc.wtdSales)} (${varianceText(calc.wtdVariance)} to budget; ${varianceText(calc.lyVariance)} to LY)`,
    `Loyalty Opportunity: ${percent(calc.opportunityLoyalty)} · Transaction Loyalty: ${percent(calc.transactionLoyalty)}`,
    ...(reportContestLines().length ? ["", "ACTIVE CONTESTS", ...reportContestLines()] : []),
    "", "FLOOR UPDATE", floorUpdate || "No floor update added.",
  ].join("\n");
  document.querySelector("#midday-preview").textContent = report;
  const workflow = workflowForToday();
  workflow.middayFloorUpdate = floorUpdate;
  workflow.middayGeneratedAt = new Date().toISOString();
  persist("Midday report generated and saved.");
  renderToday();
}

function generatePeriodReport() {
  const calc = calculations();
  const type = document.querySelector("#period-report-type").value;
  const start = document.querySelector("#period-start").value;
  const end = document.querySelector("#period-end").value;
  const report = [
    `STORE ${state.store.number} ${state.store.name.toUpperCase()} — ${type.toUpperCase()}`,
    `${dateText(start, { month: "long", day: "numeric", year: "numeric" })} through ${dateText(end, { month: "long", day: "numeric", year: "numeric" })}`, "",
    "PERFORMANCE",
    `Sales: ${money(calc.wtdSales)} (${varianceText(calc.wtdVariance)} to budget; ${varianceText(calc.lyVariance)} to LY)`,
    `Buyback: ${number(calc.received)} received · ${number(calc.nonRetail)} no-retail · ${number(calc.shelvable)} shelvable · ${number(calc.usedUnitsSold)} used units sold · ratio ${ratio(calc.buybackRatio)}`,
    `Loyalty: ${percent(calc.opportunityLoyalty)} opportunity · ${percent(calc.transactionLoyalty)} transaction`,
    ...(access.canViewPayroll ? [`Payroll: ${money(calc.actualCost, 2)} actual · ${money(calc.scheduledCost, 2)} scheduled · ${money(calc.budget.payrollBudget - calc.actualCost, 2)} variance`] : []),
    ...(reportContestLines().length ? ["", "CONTESTS", ...reportContestLines()] : []), "",
    "ASSOCIATE RESULTS", ...(periodAssociateLines(start, end).length ? periodAssociateLines(start, end) : ["No associate results recorded for this period."]), "",
    "ACCOMPLISHMENTS / WINS", document.querySelector("#period-wins").value.trim() || state.nightly.wins || "None noted.", "",
    ...(access.canViewCommunications ? ["OUTSTANDING FOLLOW-UP", state.communications.filter((entry) => entry.status !== "Resolved").map((entry) => `• ${entry.notes}`).join("\n") || "None.", ""] : []),
    "MANAGER COMMENTARY", document.querySelector("#period-commentary").value.trim() || "None noted.",
  ].join("\n");
  const associates = periodAssociateResults(start, end);
  const contests = activeContests().map((contest) => {
    const total = contestTotals(contest);
    return {
      name: contest.name,
      result: formatContestResult(contest, total.result),
      goal: formatContestResult(contest, contest.goal),
      progress: percent(safeDivide(total.result, contest.goal) * 100),
    };
  });
  renderPeriodReport({ type, start, end, report, calc, associates, contests });
  return { type, report };
}

function renderPeriodReport({ type, start, end, report, calc, associates, contests }) {
  const followups = access.canViewCommunications ? state.communications.filter((entry) => entry.status !== "Resolved") : [];
  const wins = document.querySelector("#period-wins").value.trim() || state.nightly.wins || "None noted.";
  const commentary = document.querySelector("#period-commentary").value.trim() || "None noted.";
  const dateRange = start === end
    ? dateText(start, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : `${dateText(start, { month: "long", day: "numeric", year: "numeric" })} – ${dateText(end, { month: "long", day: "numeric", year: "numeric" })}`;
  const contestMarkup = contests.length ? `
    <section class="period-section">
      <h3>Contest Progress</h3>
      <div class="period-contest-grid">${contests.map((contest) => `
        <div><span>${esc(contest.name)}</span><strong>${esc(contest.result)} / ${esc(contest.goal)}</strong><small>${esc(contest.progress)} complete</small></div>`).join("")}
      </div>
    </section>` : "";
  const associateMarkup = associates.length ? `
    <div class="period-table-wrap"><table class="period-table"><thead><tr><th>Associate</th><th>Received</th><th>No-retail</th><th>Shelvable</th><th>Contest results</th></tr></thead>
    <tbody>${associates.map((associate) => `<tr><td><strong>${esc(associate.name)}</strong></td><td>${number(associate.received)}</td><td>${number(associate.nonRetail)}</td><td>${number(associate.shelvable)}</td><td>${esc(Object.entries(associate.contests).map(([name, result]) => `${name}: ${number(result, 2)}`).join(" · ") || "—")}</td></tr>`).join("")}</tbody></table></div>`
    : `<p class="period-empty">No associate results recorded for this period.</p>`;
  const preview = document.querySelector("#period-preview");
  preview.dataset.plainText = report;
  preview.className = "period-report-document";
  preview.innerHTML = `
    <header class="period-report-header">
      <div class="period-report-logo"><img src="assets/2nc-logo.png" alt="2nd & Charles"></div>
      <div><p>STORE ${esc(state.store.number)} · ${esc(state.store.name)}</p><h2>${esc(type)}</h2><span>${esc(dateRange)}</span></div>
      <div class="period-report-badge">FY${String(state.fiscalYear).slice(-2)}<strong>W${state.fiscalWeek}</strong></div>
    </header>
    <section class="period-section">
      <h3>Performance Overview</h3>
      <div class="period-metric-grid">
        <div><span>Sales</span><strong>${money(calc.wtdSales)}</strong><small>${varianceText(calc.wtdVariance)} to budget</small></div>
        <div><span>Buyback Ratio</span><strong>${ratio(calc.buybackRatio)}</strong><small>${number(calc.received)} units received</small></div>
        <div><span>Loyalty Opportunity</span><strong>${percent(calc.opportunityLoyalty)}</strong><small>${percent(calc.transactionLoyalty)} transaction</small></div>
        ${access.canViewPayroll ? `<div><span>Payroll</span><strong>${money(calc.actualCost, 2)}</strong><small>${money(calc.budget.payrollBudget - calc.actualCost, 2)} variance</small></div>` : ""}
      </div>
    </section>
    ${contestMarkup}
    <section class="period-section"><h3>Associate Results</h3>${associateMarkup}</section>
    <div class="period-notes-grid">
      <section class="period-section"><h3>Accomplishments &amp; Wins</h3><p>${esc(wins)}</p></section>
      ${access.canViewCommunications ? `<section class="period-section"><h3>Outstanding Follow-up</h3>${followups.length ? `<ul>${followups.map((entry) => `<li>${esc(entry.notes)}</li>`).join("")}</ul>` : "<p>None.</p>"}</section>` : ""}
    </div>
    <section class="period-section period-commentary"><h3>Manager Commentary</h3><p>${esc(commentary)}</p></section>
    <footer class="period-report-footer"><span>Generated ${esc(new Date().toLocaleString())}</span><strong>2NC Store Operations Dashboard</strong></footer>`;
}

function exportPeriodPdf() {
  generatePeriodReport();
  document.body.classList.add("printing-period");
  const previousTitle = document.title;
  document.title = `${state.store.number}-${document.querySelector("#period-report-type").value.replaceAll(" ", "-")}`;
  const cleanup = () => {
    document.body.classList.remove("printing-period");
    document.title = previousTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => window.print(), 50);
}

function renderAll() {
  ensureAssociateDaily();
  document.body.classList.toggle("payroll-tools-off", !state.payrollToolsActive || !access.canViewPayroll);
  document.body.classList.toggle("no-payroll-access", !access.canViewPayroll);
  document.body.classList.toggle("no-communications-access", !access.canViewCommunications);
  document.body.classList.toggle("owner-access", access.role === "owner" || access.role === "demo");
  document.body.classList.toggle("shortcuts-off", !state.keyboardShortcutsActive);
  document.body.classList.toggle("quick-mode", state.dashboardMode === "quick");
  const activePage = document.querySelector("[data-page-panel].active")?.dataset.pagePanel || "today";
  document.body.classList.toggle("active-page-today", activePage === "today");
  const navButtons = [...document.querySelectorAll(".nav-link")];
  navButtons.forEach((button) => {
    const modeHidden = state.dashboardMode === "quick" && quickModeHiddenPages.has(button.dataset.page);
    const accessHidden = button.dataset.page === "communications" && !access.canViewCommunications;
    button.classList.toggle("quick-mode-hidden", modeHidden);
    button.classList.toggle("access-hidden", accessHidden);
  });
  let quickIndex = 0;
  navButtons.forEach((button, fullIndex) => {
    const number = button.querySelector("span");
    if (!number) return;
    const visibleInQuick = !quickModeHiddenPages.has(button.dataset.page)
      && !(button.dataset.page === "communications" && !access.canViewCommunications);
    if (state.dashboardMode === "quick" && visibleInQuick) quickIndex += 1;
    number.textContent = String(state.dashboardMode === "quick" && visibleInQuick ? quickIndex : fullIndex + 1).padStart(2, "0");
  });
  document.querySelectorAll("[data-dashboard-mode]").forEach((button) => {
    const active = button.dataset.dashboardMode === state.dashboardMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#mode-description").textContent = state.dashboardMode === "quick"
    ? "Daily scheduling, results, communications, and reports."
    : "All planning, reporting, and setup tools are visible.";
  renderFiscalControls();
  document.querySelector("#sidebar-store-name").textContent = state.store.number === "DEMO" ? "Demo Store" : `Store ${state.store.number}`;
  const suiteStoreContext = document.querySelector("#suite-store-context");
  if (suiteStoreContext) suiteStoreContext.textContent = `${state.store.number === "DEMO" ? "Demonstration store" : `Store ${state.store.number}`} • Daily operations`;
  const currentAppStore = document.querySelector("#current-app-store");
  if (currentAppStore) currentAppStore.textContent = `Today at ${state.store.number === "DEMO" ? "the demonstration store" : `Store ${state.store.number}`}`;
  renderToday(); renderSetup(); renderGoals(); renderSchedule(); renderResults(); renderAgenda(); renderNightly(); renderMidday(); renderCommunications(); renderSnapshots();
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
  if (page === "communications" && !access.canViewCommunications) {
    showToast("Your account does not have Communication Log access.");
    return;
  }
  if (state.dashboardMode === "quick" && quickModeHiddenPages.has(page)) {
    showToast("That tool is available in Full mode.");
    return;
  }
  document.querySelectorAll("[data-page-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === page));
  document.querySelectorAll(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  document.querySelector("#page-title").textContent = pageNames[page][0];
  document.querySelector("#page-eyebrow").textContent = pageNames[page][1];
  document.body.classList.toggle("active-page-today", page === "today");
  setToolsDrawer(false);
  // Page height can change dramatically between tools on a phone. Jumping to
  // the top prevents iOS from animating through an invalid former scroll range.
  window.scrollTo(0, 0);
}

function setToolsDrawer(open) {
  document.body.classList.toggle("nav-open", open);
  const scrim = document.querySelector("#drawer-scrim");
  const button = document.querySelector("#all-tools-button");
  if (scrim) scrim.hidden = !open;
  if (button) button.setAttribute("aria-expanded", String(open));
}

function saveSetup() {
  const oldNames = state.associates.map((a) => a.name);
  const nextAssociates = [...document.querySelectorAll("[data-associate-index]")].map((row) => ({
    name: row.querySelector('[data-field="name"]').value.trim(), id: row.querySelector('[data-field="id"]').value.trim(),
    loginName: row.querySelector('[data-field="loginName"]').value.trim(),
    role: row.querySelector('[data-field="role"]').value, payRate: Number(row.querySelector('[data-field="payRate"]').value || 0),
  })).filter((a) => a.name);
  const loginNames = nextAssociates.map((associate) => normalizedLogin(associate.loginName)).filter(Boolean);
  if (new Set(loginNames).size !== loginNames.length) {
    showToast("Each WordPress login can only be assigned to one associate.");
    return;
  }
  state.store = { number: document.querySelector("#store-number").value.trim(), name: document.querySelector("#store-name").value.trim(), gm: document.querySelector("#gm-name").value.trim(), weekStart: document.querySelector("#week-start").value };
  state.payrollToolsActive = document.querySelector("#payroll-tools-enabled").checked;
  state.keyboardShortcutsActive = document.querySelector("#keyboard-shortcuts-enabled").checked;
  state.associates = nextAssociates;
  state.contestsEnabled = document.querySelector("#contests-enabled").checked;
  [...document.querySelectorAll("[data-contest-index]")].forEach((row, index) => {
    state.contests[index].active = row.querySelector('[data-field="active"]').checked;
    state.contests[index].name = row.querySelector('[data-field="name"]').value.trim();
    state.contests[index].metric = row.querySelector('[data-field="metric"]').value;
    state.contests[index].goal = Number(row.querySelector('[data-field="goal"]').value || 0);
    state.contests[index].startWeek = Number(row.querySelector('[data-field="startWeek"]').value || state.fiscalWeek);
    state.contests[index].endWeek = Number(row.querySelector('[data-field="endWeek"]').value || state.fiscalWeek);
  });
  state.weeklySchedule.flat().forEach((shift) => {
    const idx = oldNames.indexOf(shift.associate);
    if (idx >= 0 && state.associates[idx]) shift.associate = state.associates[idx].name;
  });
  persist("Store, associates, pay rates, shortcuts, and contest controls saved."); renderAll();
}

function saveGoals() {
  state.budgets = [...document.querySelectorAll("[data-budget-index]")].map((row, index) => ({
    day: state.budgets[index].day,
    isHoliday: Boolean(state.budgets[index].isHoliday), holidayName: state.budgets[index].holidayName || "",
    holidayMultiplier: Number(state.budgets[index].holidayMultiplier) === 2 ? 2 : 1.5,
    ...Object.fromEntries(["date", "budget", "lastYear", "buybackGoal", "lyBuybackUnits", "lyBuybackRatio", "payrollBudget"].map((field) => {
      const value = row.querySelector(`[data-field="${field}"]`).value;
      return [field, field === "date" ? value : Number(value || 0)];
    })),
  }));
  document.querySelectorAll(".goal-field").forEach((input) => { state.goals[input.dataset.goal] = Number(input.value || 0); });
  persist("Sales, buyback, loyalty, and payroll plans saved."); renderAll();
}

function collectHolidaySettings() {
  const budget = state.budgets[state.selectedScheduleDay];
  if (!budget) return;
  budget.isHoliday = document.querySelector("#schedule-holiday").checked;
  budget.holidayName = document.querySelector("#holiday-name").value.trim();
  budget.holidayMultiplier = Number(document.querySelector("#holiday-multiplier").value) === 2 ? 2 : 1.5;
}
function collectSchedule() {
  collectHolidaySettings();
  state.weeklySchedule[state.selectedScheduleDay] = [...document.querySelectorAll("[data-shift-index]")].map((row) => ({
    associate: row.querySelector('[data-field="associate"]').value, start: row.querySelector('[data-field="start"]').value,
    end: row.querySelector('[data-field="end"]').value, position: row.querySelector('[data-field="position"]').value,
    breakAt: row.querySelector('[data-field="breakAt"]').value.trim(), breakMinutes: Number(row.querySelector('[data-field="breakMinutes"]').value || 0),
    assignment: row.querySelector('[data-field="assignment"]').value.trim(),
  }));
}
function saveSchedule() {
  collectSchedule();
  const invalidShift = state.weeklySchedule[state.selectedScheduleDay].find((shift) => !normalizeTimeInput(shift.start) || !normalizeTimeInput(shift.end));
  if (invalidShift) {
    showToast("Correct the highlighted start or end time before saving.");
    return;
  }
  state.weeklySchedule[state.selectedScheduleDay].forEach((shift) => {
    shift.start = normalizeTimeInput(shift.start);
    shift.end = normalizeTimeInput(shift.end);
  });
  state.priorities = [...document.querySelectorAll(".priority-field")].map((input) => input.value.trim()).filter(Boolean);
  state.teamMessage = document.querySelector("#team-message").value.trim();
  persist("Weekly schedule and assignments saved."); renderAll();
}

function saveResults() {
  state.results = draftResults();
  state.actualHoursByDate ||= {};
  state.actualHoursByDate[state.operatingDate] = clone(state.results.actualHours);
  ensureAssociateDaily();
  document.querySelectorAll(".daily-associate-field").forEach((input) => {
    const entry = state.associateDaily[input.dataset.associate];
    if (input.dataset.contest) {
      entry.contests[input.dataset.contest] ||= { result: 0, units: 0, transactions: 0 };
      entry.contests[input.dataset.contest][input.dataset.field] = Number(input.value || 0);
    } else {
      entry[input.dataset.field] = Number(input.value || 0);
    }
  });
  state.results.receivedUnits = Object.values(state.associateDaily).reduce((sum, entry) => sum + Number(entry.buybackReceived || 0), 0);
  state.results.nonRetailUnits = Object.values(state.associateDaily).reduce((sum, entry) => sum + Number(entry.buybackNonRetail || 0), 0);
  state.results.shelvableUnits = Math.max(0, state.results.receivedUnits - state.results.nonRetailUnits);
  activeContests().forEach((contest) => {
    const week = { result: 0, units: 0, transactions: 0, associateResults: {} };
    state.associates.forEach((associate) => {
      const values = state.associateDaily[associate.name]?.contests?.[contest.id] || {};
      week.result += Number(values.result || 0); week.units += Number(values.units || 0); week.transactions += Number(values.transactions || 0);
      week.associateResults[associate.name] = Number(values.result || 0);
    });
    contest.weeklyResults ||= {};
    contest.weeklyResults[weekKey()] = week;
  });
  const workflow = workflowForToday();
  workflow.resultsUpdatedAt = new Date().toISOString();
  workflow.resultsUpdatedBy = signedInUserName() || state.store.gm || "Manager";
  persist("Daily associate, buyback, payroll, and contest results saved."); renderAll();
}

function generateNightlyReport() {
  state.nightly = Object.fromEntries(["mod", "wins", "opportunities", "followup", "handoff"].map((key) => [key, document.querySelector(`#nightly-${key}`).value.trim()]));
  const calc = calculations();
  const contestLines = activeContests().map((contest) => {
    const total = contestTotals(contest);
    const leaders = Object.entries(total.associateResults || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, value]) => `${name} ${contest.metric === "dollars" ? money(value) : number(value)}`).join(", ");
    return `${contest.name}: ${formatContestResult(contest, total.result)} / ${formatContestResult(contest, contest.goal)}${contest.id === "bookDrive" ? `; ${number(total.units)} units; avg transaction ${total.transactions ? money(total.result / total.transactions, 2) : "—"}` : ""}${leaders ? `; leaders: ${leaders}` : ""}`;
  });
  const report = [
    `STORE ${state.store.number} ${state.store.name.toUpperCase()} — NIGHTLY REPORT`,
    dateText(state.operatingDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), `Closing MOD: ${state.nightly.mod}`, "",
    "PERFORMANCE", `Sales: ${money(calc.sales)} (${varianceText(calc.salesVariance)} to budget)`,
    `WTD Sales: ${money(calc.wtdSales)} (${varianceText(calc.wtdVariance)} to budget; ${varianceText(calc.lyVariance)} to LY)`,
    `Loyalty Opportunity: ${percent(calc.opportunityLoyalty)} (goal ${percent(state.goals.loyalty)})`,
    `Transaction Loyalty: ${percent(calc.transactionLoyalty)}`,
    `Buyback Ratio: ${ratio(calc.buybackRatio)} (goal ${ratio(state.goals.buybackRatio)})`,
    ...(access.canViewPayroll ? [`Payroll: ${number(calc.actualHours, 2)} worked / ${number(calc.scheduledHours, 2)} scheduled hours; ${money(calc.actualCost, 2)} actual / ${money(calc.scheduledCost, 2)} scheduled cost`] : []),
    ...(contestLines.length ? ["", "ACTIVE CONTESTS", ...contestLines] : []), "",
    "WINS / CELEBRATIONS", state.nightly.wins || "None noted.", "", "OPPORTUNITIES / MISSES", state.nightly.opportunities || "None noted.", "",
    "FOLLOW-UP", state.nightly.followup || "None noted.", "", "TOMORROW’S HANDOFF", state.nightly.handoff || "None noted.",
  ].join("\n");
  document.querySelector("#report-preview").textContent = report;
  workflowForToday().nightlyGeneratedAt = new Date().toISOString();
  persist("Nightly report generated and saved.");
  renderToday();
}

function copyGoalsForward() {
  saveGoals();
  const source = clone(state.budgets);
  const nextWeek = state.fiscalWeek === 53 ? 1 : state.fiscalWeek + 1;
  const nextYear = state.fiscalWeek === 53 ? state.fiscalYear + 1 : state.fiscalYear;
  activateWeek(nextYear, nextWeek);
  state.budgets = state.budgets.map((row, index) => ({
    ...row, budget: source[index].budget, lastYear: source[index].lastYear, buybackGoal: source[index].buybackGoal,
    lyBuybackUnits: source[index].lyBuybackUnits, lyBuybackRatio: source[index].lyBuybackRatio, payrollBudget: source[index].payrollBudget,
  }));
  persist(`Goals copied to FY${String(nextYear).slice(-2)} Week ${nextWeek}.`); renderAll();
}

function importPlanRows() {
  const rows = document.querySelector("#bulk-plan-data").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let imported = 0;
  rows.forEach((line) => {
    const [weekRaw, dayRaw, budget, lastYear, bbGoal, lyUnits, lyRatio, payroll] = line.split(",").map((value) => value.trim());
    const week = Number(weekRaw); const dayIndex = days.findIndex((day) => day.toLowerCase().startsWith(dayRaw.toLowerCase().slice(0, 3)));
    if (!week || dayIndex < 0) return;
    const key = weekKey(state.fiscalYear, week);
    state.weeks[key] ||= emptyWeek(state.fiscalYear, week);
    Object.assign(state.weeks[key].budgets[dayIndex], {
      budget: Number(budget || 0), lastYear: Number(lastYear || 0), buybackGoal: Number(bbGoal || 0),
      lyBuybackUnits: Number(lyUnits || 0), lyBuybackRatio: Number(lyRatio || 0), payrollBudget: Number(payroll || 0),
    });
    imported += 1;
  });
  const selected = clone(state.weeks[weekKey()] || {});
  if (selected.budgets) Object.assign(state, selected);
  persist(`${imported} planning rows imported.`); renderAll();
}

function saveCommunicationRows() {
  document.querySelectorAll("[data-communication-index]").forEach((row) => {
    const entry = state.communications[Number(row.dataset.communicationIndex)];
    row.querySelectorAll(".communication-field").forEach((field) => { entry[field.dataset.field] = field.value; });
  });
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]"); const go = event.target.closest("[data-go]");
  if (nav) goTo(nav.dataset.page);
  if (go) { event.preventDefault(); goTo(go.dataset.go); }
  const phaseToggle = event.target.closest("[data-phase-toggle]");
  if (phaseToggle) {
    openPhase = openPhase === phaseToggle.dataset.phaseToggle ? null : phaseToggle.dataset.phaseToggle;
    renderGuidedPhases();
  }
  const phaseOpener = event.target.closest("[data-open-phase]");
  if (phaseOpener && !phaseOpener.dataset.go) {
    openPhase = phaseOpener.dataset.openPhase;
    renderGuidedPhases();
    document.querySelector(`[data-phase="${openPhase}"]`)?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }
  if (event.target.closest("#complete-start-phase")) {
    const workflow = workflowForToday();
    workflow.startReviewedAt = new Date().toISOString();
    workflow.startReviewedBy = signedInUserName() || state.store.gm || "Manager";
    openPhase = "run";
    persist("Today’s plan reviewed. Run shift is ready.");
    renderToday();
  }
  const modeButton = event.target.closest("[data-dashboard-mode]");
  if (modeButton) {
    state.dashboardMode = modeButton.dataset.dashboardMode;
    if (state.dashboardMode === "quick" && document.querySelector("[data-page-panel].active")?.dataset.pagePanel && quickModeHiddenPages.has(document.querySelector("[data-page-panel].active").dataset.pagePanel)) {
      document.querySelectorAll("[data-page-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === "today"));
      document.querySelector("#page-title").textContent = pageNames.today[0];
      document.querySelector("#page-eyebrow").textContent = pageNames.today[1];
    }
    persist(`${state.dashboardMode === "quick" ? "Quick" : "Full"} mode active.`);
    renderAll();
  }
  if (event.target.closest("#all-tools-button")) setToolsDrawer(!document.body.classList.contains("nav-open"));
  if (event.target.closest("#all-tools-close, #drawer-scrim")) setToolsDrawer(false);
  if (event.target.closest("#change-day-button")) {
    const dialog = document.querySelector("#day-dialog");
    const picker = document.querySelector("#guided-operating-date");
    const source = document.querySelector("#operating-date");
    picker.min = source.min; picker.max = source.max; picker.value = state.operatingDate;
    dialog.showModal();
  }
  if (event.target.closest("#use-guided-date")) {
    const dialog = document.querySelector("#day-dialog");
    const source = document.querySelector("#operating-date");
    source.value = document.querySelector("#guided-operating-date").value;
    source.dispatchEvent(new Event("change", { bubbles: true }));
    dialog.close();
  }
  if (event.target.closest("#account-menu")) window.StoreOpsProduction?.openAccount();
  if (event.target.closest("#another-fact")) { factOffset += 1; renderFact(); }
  const appMenu = document.querySelector("#app-menu");
  if (appMenu?.open && !event.target.closest("#app-menu")) appMenu.removeAttribute("open");
  if (event.target.closest("#export-backup")) window.StoreOpsProduction?.exportBackup(clone(state));
  if (event.target.closest("#restore-backup")) document.querySelector("#restore-backup-file").click();
  if (event.target.closest("#cloud-backup")) window.StoreOpsProduction?.createCloudBackup(clone(state));
  if (event.target.closest("#save-setup")) saveSetup();
  if (event.target.closest("#save-goals")) saveGoals();
  if (event.target.closest("#save-schedule")) saveSchedule();
  if (event.target.closest("#save-results")) saveResults();
  if (event.target.closest("#generate-report")) generateNightlyReport();
  if (event.target.closest("#generate-midday")) generateMiddayReport();
  if (event.target.closest("#generate-period")) generatePeriodReport();
  if (event.target.closest("#export-period-pdf")) exportPeriodPdf();
  if (event.target.closest("#print-agenda")) window.print();
  if (event.target.closest("#bulk-plan-toggle")) document.querySelector("#bulk-plan-panel").hidden = !document.querySelector("#bulk-plan-panel").hidden;
  if (event.target.closest("#import-plan")) importPlanRows();
  if (event.target.closest("#copy-goals-forward")) copyGoalsForward();
  if (event.target.closest("#add-communication")) {
    saveCommunicationRows();
    state.communications.unshift({ dateTime: `${state.operatingDate}T12:00`, associate: "", manager: state.store.gm, category: "General", notes: "", followup: "", status: "Open" });
    persist("New communication entry added."); renderCommunications();
  }
  const removeCommunication = event.target.closest(".remove-communication");
  if (removeCommunication) {
    state.communications.splice(Number(removeCommunication.closest("[data-communication-index]").dataset.communicationIndex), 1);
    persist("Communication entry removed."); renderCommunications();
  }
  if (event.target.closest("#save-snapshot")) {
    const generated = generatePeriodReport();
    const preview = document.querySelector("#period-preview");
    const snapshot = {
      id: Date.now(), title: `${generated.type} · FY${String(state.fiscalYear).slice(-2)} W${state.fiscalWeek}`,
      created: new Date().toLocaleString(), report: generated.report, html: preview.innerHTML,
    };
    state.reportSnapshots.push(snapshot); persist("Permanent report snapshot saved."); renderSnapshots();
  }
  const loadSnapshot = event.target.closest(".load-snapshot");
  if (loadSnapshot) {
    const snapshot = state.reportSnapshots.find((item) => String(item.id) === loadSnapshot.dataset.snapshotId);
    if (snapshot) {
      const preview = document.querySelector("#period-preview");
      preview.dataset.plainText = snapshot.report;
      if (snapshot.html) {
        preview.className = "period-report-document";
        preview.innerHTML = snapshot.html;
      } else {
        preview.className = "period-report-placeholder";
        preview.textContent = snapshot.report;
      }
    }
  }
  const dayTab = event.target.closest("[data-schedule-day]");
  if (dayTab) { collectSchedule(); state.selectedScheduleDay = Number(dayTab.dataset.scheduleDay); renderSchedule(); }
  if (event.target.closest("#add-associate")) { state.associates.push({ name: "New associate", id: "", loginName: "", role: "Associate", payRate: 14 }); renderSetup(); }
  const removeAssociate = event.target.closest(".remove-associate");
  if (removeAssociate) { state.associates.splice(Number(removeAssociate.closest("[data-associate-index]").dataset.associateIndex), 1); renderSetup(); }
  if (event.target.closest("#add-shift")) {
    collectSchedule(); state.weeklySchedule[state.selectedScheduleDay].push({ associate: state.associates[0]?.name || "Associate", start: "09:00", end: "17:00", position: "Associate", breakAt: "1:00", breakMinutes: 30, assignment: "" }); renderSchedule();
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
  if (event.target.closest("#copy-midday")) navigator.clipboard.writeText(document.querySelector("#midday-preview").textContent).then(() => showToast("Midday report copied."));
  if (event.target.closest("#copy-period")) {
    const preview = document.querySelector("#period-preview");
    navigator.clipboard.writeText(preview.dataset.plainText || preview.textContent).then(() => showToast("Period report copied."));
  }
  if (event.target.closest("#reset-demo") && window.confirm("Reset all prototype entries on this device to the original sample data?")) {
    state = clone(defaultState); localStorage.removeItem(STORAGE_KEY); renderAll(); goTo("today"); showToast("Prototype reset.");
  }
});

document.querySelector("#restore-backup-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const restored = JSON.parse(await file.text());
    const payload = restored.state || restored;
    if (!payload.store || !Array.isArray(payload.associates) || !Array.isArray(payload.budgets)) throw new Error("Invalid backup");
    if (!window.confirm(`Restore the backup created ${restored.exportedAt || "on an unknown date"}? This replaces the current dashboard data.`)) return;
    state = migrate(payload);
    persist("Backup restored and saved.");
    renderAll();
  } catch {
    showToast("That file is not a valid Store Operations backup.");
  } finally {
    event.target.value = "";
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches(".budget-field")) updateBudgetTotalsFromInputs();
  if (event.target.matches(".daily-associate-field")) updateAssociateDailyTotals();
  if (event.target.closest("#page-results")) updateResultCallouts();
  if (event.target.matches(".communication-field")) { saveCommunicationRows(); persist("Communication log saved."); }
  if (event.target.matches("#communication-search, #communication-status-filter, #communication-category-filter")) renderCommunications();
  if (event.target.matches(".shift-field")) {
    collectSchedule(); renderWeekOverview(); renderScheduleWarnings();
    const row = event.target.closest("[data-shift-index]"); const shift = state.weeklySchedule[state.selectedScheduleDay][Number(row.dataset.shiftIndex)];
    row.querySelectorAll("output")[0].textContent = `${number(shiftHours(shift), 2)}h`; row.querySelectorAll("output")[1].textContent = money(shiftCost(shift), 2);
  }
  if (event.target.matches("#holiday-name, #holiday-multiplier")) {
    collectHolidaySettings(); renderWeekOverview(); renderScheduleWarnings();
  }
});
document.querySelector("#schedule-holiday").addEventListener("change", (event) => {
  collectHolidaySettings();
  document.querySelector("#holiday-details").hidden = !event.target.checked;
  renderWeekOverview(); renderScheduleWarnings();
});
document.addEventListener("focusout", (event) => {
  if (!event.target.matches(".shift-time-field")) return;
  const normalized = normalizeTimeInput(event.target.value);
  if (!normalized) {
    event.target.setAttribute("aria-invalid", "true");
    showToast("Enter a time such as 9:00 AM, 5:30 PM, 0900, or 1730.");
    return;
  }
  event.target.removeAttribute("aria-invalid");
  event.target.value = normalized;
  collectSchedule();
  renderWeekOverview();
  const row = event.target.closest("[data-shift-index]");
  const shift = state.weeklySchedule[state.selectedScheduleDay][Number(row.dataset.shiftIndex)];
  row.querySelectorAll("output")[0].textContent = `${number(shiftHours(shift), 2)}h`;
  row.querySelectorAll("output")[1].textContent = money(shiftCost(shift), 2);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelector("#app-menu")?.removeAttribute("open");
    setToolsDrawer(false);
  }
  if (!state.keyboardShortcutsActive) return;
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
  const shortcutPages = ["periods", "today", "setup", "goals", "schedule", "results", "agenda", "nightly", "midday", "communications"];
  if (!/^[0-9]$/.test(event.key)) return;
  event.preventDefault();
  goTo(shortcutPages[Number(event.key)]);
});
document.querySelector("#period-report-type").addEventListener("change", (event) => {
  if (event.target.value !== "End of Day") return;
  document.querySelector("#period-start").value = state.operatingDate;
  document.querySelector("#period-end").value = state.operatingDate;
});
document.querySelector("#contests-enabled").addEventListener("change", (event) => document.querySelector("#contest-setup-rows").classList.toggle("disabled-section", !event.target.checked));
document.querySelector("#fiscal-year").addEventListener("change", (event) => {
  activateWeek(Number(event.target.value), state.fiscalWeek); persist("Fiscal year updated."); renderAll();
});
document.querySelector("#fiscal-week").addEventListener("change", (event) => {
  activateWeek(state.fiscalYear, Number(event.target.value)); persist("Fiscal week updated."); renderAll();
});
document.querySelector("#operating-date").addEventListener("change", (event) => {
  state.operatingDate = event.target.value; const index = state.budgets.findIndex((row) => row.date === state.operatingDate); if (index >= 0) state.selectedScheduleDay = index;
  state.results.actualHours = clone(state.actualHoursByDate?.[state.operatingDate] || {});
  openPhase = undefined;
  persist("Operating date updated."); renderAll();
});

renderAll();
setInterval(() => { refreshTodayHeader(); renderFact(); }, 60000);
window.StoreOpsApp = {
  getState: () => clone(state),
  setAccess: (nextAccess = {}) => {
    access = { ...access, ...nextAccess };
    renderAll();
  },
  replaceState: (nextState, message = "Secure data loaded.") => {
    state = migrate(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    showToast(message);
  },
  showToast,
  calculatePayroll: payrollBreakdown,
};
window.StoreOpsProduction?.init(window.StoreOpsApp);
