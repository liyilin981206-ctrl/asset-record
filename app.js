const formatMoney = (value) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);

const positiveOps = ["投入"];
const negativeOps = ["取出"];
const platforms = ["支付宝", "同花顺", "且慢", "中国银行", "招商银行", "广发基金", "博时基金"];
const classColors = { "防御": "#8b5cf6", "稳健": "#7c3aed", "进攻": "#c084fc", "未分类": "#9ca3af" };
const typeColors = ["#8b5cf6", "#a78bfa", "#c084fc", "#f0abfc", "#818cf8", "#a855f7", "#d946ef"];
const appToday = new Date();
const currentMonth = `${appToday.getFullYear()}-${String(appToday.getMonth() + 1).padStart(2, "0")}`;
const currentYear = String(appToday.getFullYear());
const recordPageSize = 7;
const sessionKey = "assetTracker.currentAccount";
const dataKeyPrefix = "assetTracker.account.";
const viewOptions = ["overview", "record", "plan", "mine"];
const initialView = new URLSearchParams(window.location.search).get("view");
const accountStartDate = new Date("2024-03-01T00:00:00");

const initialTargets = [
  { cls: "防御", type: "货币基金", target: 0.15 },
  { cls: "防御", type: "中短债基金", target: 0.1 },
  { cls: "防御", type: "增强债基", target: 0.1 },
  { cls: "防御", type: "且慢稳定定投", target: 0.05 },
  { cls: "防御", type: "黄金", target: 0.05 },
  { cls: "稳健", type: "纳斯达克100", target: 0.05 },
  { cls: "稳健", type: "标普500", target: 0.1 },
  { cls: "稳健", type: "红利低波ETF", target: 0.1 },
  { cls: "稳健", type: "中证A500", target: 0.05 },
  { cls: "稳健", type: "创业板指", target: 0.05 },
  { cls: "稳健", type: "且慢综合定投", target: 0.05 },
  { cls: "进攻", type: "股票", target: 0.05 },
  { cls: "进攻", type: "细分赛道基金", target: 0.1 },
];
const targets = initialTargets.map((item) => ({ ...item }));

const state = {
  currentAccount: "",
  loginCode: "",
  view: viewOptions.includes(initialView) ? initialView : "overview",
  selectedMonth: currentMonth,
  selectedYear: currentYear,
  selectedMonthFilter: "month",
  planScope: "total",
  recordType: "flow",
  recordView: "flow",
  recordMonth: "all",
  recordPage: 1,
  monthlyPlanYear: currentYear,
  targetEffectiveMonth: "2026-05",
  targetEditEffectiveMonth: "2026-06",
  historyTargetMonth: "2026-03",
  amountVisible: true,
  planEditMode: "",
  draftMonthlyPlans: null,
  draftTargets: null,
  allocationEntries: [],
  allocationBreakdown: {},
  monthlyPlans: {
    "默认": 50000,
    "2027-03": 100000,
  },
  flows: [
    { date: "2026-06-01", platform: "支付宝", cls: "防御", type: "货币基金", target: "", action: "投入", amount: 10000, note: "月度新增资金" },
    { date: "2026-07-01", platform: "支付宝", cls: "防御", type: "货币基金", target: "", action: "投入", amount: 43000, note: "月度新增资金" },
  ],
  snapshots: [
    { month: "2026-06", cls: "防御", type: "货币基金", start: 10000, end: 800, note: "" },
    { month: "2026-07", cls: "防御", type: "货币基金", start: 100000, end: 150000, note: "" },
  ],
};

const els = {
  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  phoneInput: document.querySelector("#phoneInput"),
  codeInput: document.querySelector("#codeInput"),
  sendCodeButton: document.querySelector("#sendCodeButton"),
  authTip: document.querySelector("#authTip"),
  accountButton: document.querySelector("#accountButton"),
  heroPrivacyButton: document.querySelector("#heroPrivacyButton"),
  accountPhoneLabel: document.querySelector("#accountPhoneLabel"),
  mineFlowCount: document.querySelector("#mineFlowCount"),
  mineSnapshotCount: document.querySelector("#mineSnapshotCount"),
  mineUseDays: document.querySelector("#mineUseDays"),
  logoutButton: document.querySelector("#logoutButton"),
  pageTitle: document.querySelector("#pageTitle"),
  nav: document.querySelector(".bottom-nav"),
  views: document.querySelectorAll(".view"),
  yearOptions: document.querySelector("#yearOptions"),
  monthOptions: document.querySelector("#monthOptions"),
  totalAsset: document.querySelector("#totalAsset"),
  assetLabel: document.querySelector("#assetLabel"),
  inLabel: document.querySelector("#inLabel"),
  outLabel: document.querySelector("#outLabel"),
  profitLabel: document.querySelector("#profitLabel"),
  periodIn: document.querySelector("#periodIn"),
  periodOut: document.querySelector("#periodOut"),
  periodProfit: document.querySelector("#periodProfit"),
  plannedIn: document.querySelector("#plannedIn"),
  netIn: document.querySelector("#netIn"),
  planStatus: document.querySelector("#planStatus"),
  planProgress: document.querySelector("#planProgress"),
  planProgressList: document.querySelector("#planProgressList"),
  planScopeTabs: document.querySelector("[aria-label='投入进度维度']"),
  donut: document.querySelector("#donutChart"),
  legend: document.querySelector("#allocationLegend"),
  allocationPopover: document.querySelector("#allocationPopover"),
  detailList: document.querySelector("#detailList"),
  detailCount: document.querySelector("#detailCount"),
  flowModal: document.querySelector("#flowModal"),
  snapshotModal: document.querySelector("#snapshotModal"),
  flowModalTitle: document.querySelector("#flowModalTitle"),
  snapshotModalTitle: document.querySelector("#snapshotModalTitle"),
  validationAlert: document.querySelector("#validationAlert"),
  validationTitle: document.querySelector("#validationTitle"),
  validationMessage: document.querySelector("#validationMessage"),
  validationClose: document.querySelector("#validationClose"),
  validationCancel: document.querySelector("#validationCancel"),
  openFlowButton: document.querySelector("#openFlowButton"),
  openSnapshotButton: document.querySelector("#openSnapshotButton"),
  flowForm: document.querySelector("#flowForm"),
  snapshotForm: document.querySelector("#snapshotForm"),
  flowPlatform: document.querySelector("#flowPlatform"),
  flowAction: document.querySelector("#flowAction"),
  flowClass: document.querySelector("#flowClass"),
  flowAsset: document.querySelector("#flowAsset"),
  snapshotClass: document.querySelector("#snapshotClass"),
  snapshotAsset: document.querySelector("#snapshotAsset"),
  recordList: document.querySelector("#recordList"),
  recordCount: document.querySelector("#recordCount"),
  recordPagination: document.querySelector("#recordPagination"),
  recordMonthOptions: document.querySelector("#recordMonthOptions"),
  recordViewTabs: document.querySelector("[aria-label='明细类型']"),
  defaultPlanInput: document.querySelector("#defaultPlanInput"),
  monthlyPlanActions: document.querySelector("#monthlyPlanActions"),
  monthlyPlanSummary: document.querySelector("#monthlyPlanSummary"),
  monthlyPlanEditor: document.querySelector("#monthlyPlanEditor"),
  monthlyPlanYearOptions: document.querySelector("#monthlyPlanYearOptions"),
  monthlyPlanList: document.querySelector("#monthlyPlanList"),
  targetPlanActions: document.querySelector("#targetPlanActions"),
  targetPlanTitle: document.querySelector("#targetPlanTitle"),
  targetPlanDescription: document.querySelector("#targetPlanDescription"),
  targetVersionNotice: document.querySelector("#targetVersionNotice"),
  targetHistoryHelper: document.querySelector("#targetHistoryHelper"),
  targetList: document.querySelector("#targetList"),
  historyTargetModal: document.querySelector("#historyTargetModal"),
  closeHistoryTarget: document.querySelector("#closeHistoryTarget"),
  cancelHistoryTarget: document.querySelector("#cancelHistoryTarget"),
  confirmHistoryTarget: document.querySelector("#confirmHistoryTarget"),
  historyMonthOptions: document.querySelector("#historyMonthOptions"),
  historyMonthLabel: document.querySelector("#historyMonthLabel"),
  historyTargetList: document.querySelector("#historyTargetList"),
};

let pendingAlertConfirm = null;

function moneyNumber(selector) {
  return Number(document.querySelector(selector).value.replace(/[^\d.]/g, "")) || 0;
}

function defaultAccountData() {
  return {
    monthlyPlans: { "默认": 50000, "2027-03": 100000 },
    flows: [
      { date: "2026-06-01", platform: "支付宝", cls: "防御", type: "货币基金", target: "", action: "投入", amount: 10000, note: "月度新增资金" },
      { date: "2026-07-01", platform: "支付宝", cls: "防御", type: "货币基金", target: "", action: "投入", amount: 43000, note: "月度新增资金" },
    ],
    snapshots: [
      { month: "2026-06", cls: "防御", type: "货币基金", start: 10000, end: 800, note: "" },
      { month: "2026-07", cls: "防御", type: "货币基金", start: 100000, end: 150000, note: "" },
    ],
    targets: initialTargets.map((item) => ({ ...item })),
  };
}

function accountDataKey(phone) {
  return `${dataKeyPrefix}${phone}`;
}

function applyAccountData(data) {
  state.monthlyPlans = { ...data.monthlyPlans };
  state.flows = data.flows.map((item) => ({ ...item }));
  state.snapshots = data.snapshots.map((item) => ({ ...item }));
  targets.splice(0, targets.length, ...data.targets.map((item) => ({ ...item })));
}

function persistAccountData() {
  if (!state.currentAccount) return;
  localStorage.setItem(accountDataKey(state.currentAccount), JSON.stringify({
    monthlyPlans: state.monthlyPlans,
    flows: state.flows,
    snapshots: state.snapshots,
    targets,
  }));
}

function loadAccountData(phone) {
  const raw = localStorage.getItem(accountDataKey(phone));
  const data = raw ? JSON.parse(raw) : defaultAccountData();
  applyAccountData(data);
  persistAccountData();
}

function maskPhone(phone) {
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

function heroMoney(value) {
  return state.amountVisible ? formatMoney(value) : "¥••••";
}

function assetIcon(cls = "", type = "") {
  if (type.includes("黄金")) return "🪙";
  if (cls === "防御") return "💰";
  if (cls === "稳健") return "📈";
  if (cls === "进攻") return "🚀";
  return "📌";
}

function useDays() {
  return Math.max(1, Math.ceil((appToday - accountStartDate) / 86400000));
}

function setAuthVisible(visible) {
  els.authScreen.classList.toggle("hidden", !visible);
  document.querySelector(".app-shell").classList.toggle("hidden", visible);
  document.querySelector(".bottom-nav").classList.toggle("hidden", visible);
}

function login(phone) {
  state.currentAccount = phone;
  localStorage.setItem(sessionKey, phone);
  loadAccountData(phone);
  setAuthVisible(false);
  els.accountButton.setAttribute("aria-label", `当前账号 ${maskPhone(phone)}`);
  els.accountButton.title = maskPhone(phone);
  els.accountPhoneLabel.textContent = maskPhone(phone);
  renderRecordOptions();
  renderAll();
}

function logout() {
  persistAccountData();
  state.currentAccount = "";
  localStorage.removeItem(sessionKey);
  els.authForm.reset();
  els.authTip.textContent = "原型阶段验证码会在本机模拟生成。";
  els.accountButton.setAttribute("aria-label", "账号");
  els.accountButton.removeAttribute("title");
  els.accountPhoneLabel.textContent = "未登录";
  setAuthVisible(true);
}

function monthLabel(month) {
  const [year, value] = month.split("-");
  return `${year} 年 ${Number(value)} 月`;
}

function addMonths(month, offset) {
  const [year, value] = month.split("-").map(Number);
  const date = new Date(year, value - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function plannedAmount(month) {
  return state.monthlyPlans[month] ?? state.monthlyPlans["默认"] ?? 50000;
}

function flowSigned(flow) {
  if (negativeOps.includes(flow.action)) return -flow.amount;
  if (positiveOps.includes(flow.action)) return flow.amount;
  return 0;
}

function periodFlows() {
  const months = selectedMonths();
  return state.flows.filter((flow) => months.includes(flow.date.slice(0, 7)));
}

function periodSnapshots() {
  const months = selectedMonths();
  return state.snapshots.filter((snapshot) => months.includes(snapshot.month));
}

function summarize(months, flows, snapshots) {
  const inAmount = flows.filter((flow) => positiveOps.includes(flow.action)).reduce((sum, flow) => sum + flow.amount, 0);
  const outAmount = flows.filter((flow) => negativeOps.includes(flow.action)).reduce((sum, flow) => sum + flow.amount, 0);
  const start = snapshots.reduce((sum, row) => sum + row.start, 0);
  const end = snapshots.reduce((sum, row) => sum + row.end, 0);
  const latestMonth = latestSnapshotMonth(snapshots);
  const endingAsset = snapshots.filter((row) => row.month === latestMonth).reduce((sum, row) => sum + row.end, 0);
  const profit = end - start - inAmount + outAmount;
  const planned = months.reduce((sum, month) => sum + plannedAmount(month), 0);
  return { inAmount, outAmount, start, end, endingAsset: endingAsset || end, profit, planned, net: inAmount - outAmount };
}

function selectedMonths() {
  if (state.selectedMonthFilter === "all") return monthOptions().filter((month) => month.startsWith(state.selectedYear));
  return [state.selectedMonth];
}

function monthOptions() {
  const options = new Set();
  const start = "2026-01";
  let cursor = start;
  while (cursor <= "2027-12") {
    options.add(cursor);
    cursor = addMonths(cursor, 1);
  }
  state.flows.forEach((flow) => options.add(flow.date.slice(0, 7)));
  state.snapshots.forEach((row) => options.add(row.month));
  Object.keys(state.monthlyPlans).forEach((month) => {
    if (month !== "默认") options.add(month);
  });
  return [...options].sort();
}

function yearOptions() {
  const latestFromMonths = monthOptions().map((month) => Number(month.slice(0, 4)));
  const end = Math.max(2027, currentYear, ...latestFromMonths);
  return Array.from({ length: end - 2026 + 1 }, (_, index) => String(2026 + index));
}

function snapshotRowsByType(snapshots) {
  const latestMonth = latestSnapshotMonth(snapshots);
  const byKey = {};
  snapshots.forEach((row) => {
    const key = `${row.cls}||${row.type}`;
    if (!byKey[key]) byKey[key] = { cls: row.cls, type: row.type, start: 0, end: 0, endingAsset: 0, inAmount: 0, outAmount: 0 };
    byKey[key].start += row.start;
    byKey[key].end += row.end;
    if (row.month === latestMonth) byKey[key].endingAsset += row.end;
  });
  periodFlows().forEach((flow) => {
    const key = `${flow.cls}||${flow.type}`;
    if (!byKey[key]) byKey[key] = { cls: flow.cls, type: flow.type, start: 0, end: 0, endingAsset: 0, inAmount: 0, outAmount: 0 };
    if (positiveOps.includes(flow.action)) byKey[key].inAmount += flow.amount;
    if (negativeOps.includes(flow.action)) byKey[key].outAmount += flow.amount;
  });
  return Object.values(byKey).map((row) => ({ ...row, endingAsset: row.endingAsset || row.end, profit: row.end - row.start - row.inAmount + row.outAmount }));
}

function latestSnapshotMonth(snapshots) {
  return snapshots.map((row) => row.month).sort().at(-1) || "";
}

function renderOverview() {
  const months = selectedMonths();
  const flows = periodFlows();
  const snapshots = periodSnapshots();
  const summary = summarize(months, flows, snapshots);
  const completion = summary.planned ? Math.round((summary.net / summary.planned) * 100) : 0;

  const isYear = state.selectedMonthFilter === "all";
  els.assetLabel.textContent = isYear ? "年度期末资产" : "期末总资产";
  els.inLabel.textContent = isYear ? "年度投入" : "本月投入";
  els.outLabel.textContent = isYear ? "年度取出" : "本月取出";
  els.profitLabel.textContent = isYear ? "年度盈亏" : "本月盈亏";
  els.totalAsset.textContent = heroMoney(summary.endingAsset);
  els.periodIn.textContent = heroMoney(summary.inAmount);
  els.periodOut.textContent = heroMoney(summary.outAmount);
  els.periodProfit.textContent = heroMoney(summary.profit);
  els.periodProfit.className = summary.profit >= 0 ? "positive" : "negative";
  els.planStatus.textContent = `目标 ${formatMoney(summary.planned)}`;
  els.plannedIn.textContent = formatMoney(summary.planned);
  els.netIn.textContent = formatMoney(summary.net);
  els.planProgress.style.width = `${Math.max(0, Math.min(100, completion))}%`;

  renderPlanProgressRows(months, flows);
  renderAllocation(flows);
  renderDetails(snapshotRowsByType(snapshots));
}

function renderPeriodOptions() {
  els.yearOptions.innerHTML = yearOptions()
    .map((option) => {
      return `<button type="button" class="${option === state.selectedYear ? "active" : ""}" data-year-option="${option}">${option}年</button>`;
    })
    .join("");

  const monthChips = monthOptions()
    .filter((month) => month.startsWith(state.selectedYear))
    .map((month) => {
      const active = state.selectedMonthFilter !== "all" && month === state.selectedMonth;
      return `<button type="button" class="${active ? "active" : ""}" data-month-option="${month}">${Number(month.slice(5))}月</button>`;
    })
    .join("");
  els.monthOptions.innerHTML = `<button type="button" class="${state.selectedMonthFilter === "all" ? "active" : ""}" data-month-option="all">全年</button>${monthChips}`;

  requestAnimationFrame(() => {
    els.yearOptions.querySelector(".active")?.scrollIntoView({ inline: "center", block: "nearest" });
    els.monthOptions.querySelector(".active")?.scrollIntoView({ inline: "center", block: "nearest" });
  });
}

function targetForType(type) {
  return targets.find((item) => item.type === type)?.target ?? 0;
}

function classTarget(cls) {
  return targets.filter((item) => item.cls === cls).reduce((sum, item) => sum + item.target, 0);
}

function renderPlanProgressRows(months, flows) {
  document.querySelectorAll("[data-plan-scope]").forEach((button) => button.classList.toggle("active", button.dataset.planScope === state.planScope));
  if (state.planScope === "total") {
    els.planProgressList.innerHTML = "";
    return;
  }
  const basePlan = months.reduce((sum, month) => sum + plannedAmount(month), 0);
  const rows = {};
  flows.forEach((flow) => {
    const key = state.planScope === "class" ? flow.cls : flow.type;
    if (!rows[key]) rows[key] = { label: key, cls: flow.cls, actual: 0, target: 0 };
    rows[key].actual += flowSigned(flow);
  });

  if (state.planScope === "class") {
    [...new Set(targets.map((item) => item.cls))].forEach((cls) => {
      if (!rows[cls]) rows[cls] = { label: cls, cls, actual: 0, target: 0 };
      rows[cls].target = basePlan * classTarget(cls);
    });
  } else {
    targets.forEach((item) => {
      if (!rows[item.type]) rows[item.type] = { label: item.type, cls: item.cls, actual: 0, target: 0 };
      rows[item.type].target = basePlan * targetForType(item.type);
    });
  }

  els.planProgressList.innerHTML = Object.values(rows)
    .sort((a, b) => b.target - a.target || b.actual - a.actual)
    .map((row) => {
      const percent = row.target ? Math.round((row.actual / row.target) * 100) : 0;
      return `
        <article class="progress-row">
          <div class="progress-row-head">
            <strong>${row.label}</strong>
            <span>${percent}%</span>
          </div>
          <div class="progress-mini"><div style="width:${Math.max(0, Math.min(100, percent))}%"></div></div>
          <div class="progress-row-foot">
            <span>已投 ${formatMoney(row.actual)}</span>
            <span>目标 ${formatMoney(row.target)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function latestSnapshots(months, snapshots) {
  const latestMonth = latestSnapshotMonth(snapshots);
  return snapshots.filter((row) => row.month === latestMonth);
}

function renderAllocation(flows) {
  const byClass = {};
  const breakdown = {};
  flows.filter((flow) => positiveOps.includes(flow.action)).forEach((flow) => {
    byClass[flow.cls] = (byClass[flow.cls] || 0) + flow.amount;
    if (!breakdown[flow.cls]) breakdown[flow.cls] = {};
    breakdown[flow.cls][flow.type] = (breakdown[flow.cls][flow.type] || 0) + flow.amount;
  });
  const entries = Object.entries(byClass).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  let cursor = 0;
  const segments = entries.map(([cls, value]) => {
    const start = cursor;
    cursor += (value / total) * 360;
    return `${classColors[cls] || classColors["未分类"]} ${start}deg ${cursor}deg`;
  });

  state.allocationEntries = entries.map(([cls, value]) => ({ cls, value, start: 0, end: 0 }));
  cursor = 0;
  state.allocationEntries.forEach((entry) => {
    entry.start = cursor;
    cursor += (entry.value / total) * 360;
    entry.end = cursor;
  });
  state.allocationBreakdown = breakdown;
  els.allocationPopover.classList.add("hidden");
  els.allocationPopover.innerHTML = "";
  els.donut.style.background = segments.length ? `conic-gradient(${segments.join(", ")})` : "#eee7fb";
  els.legend.innerHTML = entries
    .map(([cls, value]) => `<div class="legend-row"><span class="legend-dot" style="background:${classColors[cls]}"></span><span>${cls}</span><b>${Math.round((value / total) * 100)}%</b></div>`)
    .join("") || '<p class="muted">当前周期还没有投入记录。</p>';
}

function renderAllocationPopover(entry) {
  const rows = Object.entries(state.allocationBreakdown[entry.cls] || {}).sort((a, b) => b[1] - a[1]);
  const total = state.allocationEntries.reduce((sum, item) => sum + item.value, 0) || 1;
  els.allocationPopover.innerHTML = `
    <div class="popover-title">
      <strong>${entry.cls}</strong>
      <span>${Math.round((entry.value / state.allocationEntries.reduce((sum, item) => sum + item.value, 0)) * 100)}%</span>
    </div>
    ${rows.map(([type, value]) => `
      <div class="popover-row">
        <span>${type}</span>
        <b>${Math.round((value / total) * 100)}%</b>
      </div>
    `).join("")}
  `;
  els.allocationPopover.classList.remove("hidden");
}

function pickAllocationEntry(event) {
  if (!state.allocationEntries.length) return null;
  const rect = els.donut.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  return state.allocationEntries.find((entry) => angle >= entry.start && angle <= entry.end) || state.allocationEntries.at(-1);
}

function renderDetails(rows) {
  els.detailCount.textContent = `${rows.length} 项`;
  els.detailList.innerHTML =
    rows
      .sort((a, b) => b.endingAsset - a.endingAsset)
      .map((row) => `
        <article class="activity-item">
          <div class="act-icon" aria-hidden="true">${assetIcon(row.cls, row.type)}</div>
          <div class="activity-main act-body">
            <div class="activity-name act-name">${row.cls} · ${row.type}</div>
            <div class="activity-meta act-meta">投入 ${formatMoney(row.inAmount)} / 取出 ${formatMoney(row.outAmount)}</div>
          </div>
          <div class="stack-value act-right">
            <b class="act-amount">${formatMoney(row.endingAsset)}</b>
            <span class="${row.profit >= 0 ? "positive" : "negative"}">${formatMoney(row.profit)}</span>
          </div>
        </article>
      `)
      .join("") || '<p class="muted">当前周期暂无明细。</p>';
}

function renderRecordOptions() {
  const classes = [...new Set(targets.map((item) => item.cls))];
  setAppSelectOptions(els.flowPlatform, platforms);
  setAppSelectOptions(els.flowAction, ["投入", "取出"]);
  [els.flowClass, els.snapshotClass].forEach((input) => setAppSelectOptions(input, classes));
  renderAssetOptions(els.flowAsset, els.flowClass.value || classes[0]);
  renderAssetOptions(els.snapshotAsset, els.snapshotClass.value || classes[0]);
}

function setAppSelectOptions(input, options, selectedValue = "") {
  const wrapper = input.closest(".app-select");
  const trigger = wrapper.querySelector(".app-select-trigger");
  const valueLabel = trigger.querySelector("span");
  const menu = wrapper.querySelector(".app-select-menu");
  const nextValue = options.includes(selectedValue)
    ? selectedValue
    : options.includes(input.value)
      ? input.value
      : options[0] || "";
  input.value = nextValue;
  valueLabel.textContent = nextValue || "请选择";
  menu.innerHTML = options.map((name) => `
    <button type="button" class="${name === nextValue ? "active" : ""}" data-select-option="${name}" role="option" aria-selected="${name === nextValue}">
      ${name}
    </button>
  `).join("");
}

function closeAppSelects(except = null) {
  document.querySelectorAll(".app-select.open").forEach((select) => {
    if (select === except) return;
    select.classList.remove("open");
    select.querySelector(".app-select-trigger").setAttribute("aria-expanded", "false");
  });
}

function renderAssetOptions(input, cls, selectedType = "") {
  const assets = targets.filter((item) => item.cls === cls).map((item) => item.type);
  setAppSelectOptions(input, assets, selectedType);
}

function renderRecordType() {
  const flowEditing = els.flowForm.dataset.editIndex !== "";
  const snapshotEditing = els.snapshotForm.dataset.editIndex !== "";
  els.flowModalTitle.textContent = flowEditing ? "编辑流水" : "新增流水";
  els.snapshotModalTitle.textContent = snapshotEditing ? "编辑快照" : "新增快照";
}

function targetClassCards(sourceTargets, { editable = false } = {}) {
  const classOptions = ["防御", "稳健", "进攻"];
  const classMeta = {
    "防御": { tone: "defense" },
    "稳健": { tone: "steady" },
    "进攻": { tone: "growth" },
  };
  const byClass = sourceTargets.reduce((store, item) => {
    store[item.cls] = (store[item.cls] || 0) + item.target;
    return store;
  }, {});
  if (!editable) {
    return classOptions
      .map((cls) => {
        const meta = classMeta[cls] || classMeta["稳健"];
        return `
        <article class="target-class-summary is-${meta.tone}">
          <div class="target-class-head">
            <div class="class-label">
              <div>
                <strong>${cls}</strong>
              </div>
            </div>
            <b>${Math.round((byClass[cls] || 0) * 100)}<small>%</small></b>
          </div>
          <div class="target-type-list">
            ${sourceTargets.filter((item) => item.cls === cls).map((item, index) => `
              <div class="target-type-row">
                <span><i style="--dot-index:${index}"></i>${item.type}</span>
                <b>${Math.round(item.target * 100)}%</b>
              </div>
            `).join("") || '<div class="target-type-row"><span>暂无小类</span><b>0%</b></div>'}
          </div>
        </article>
      `;
      })
      .join("");
  }
  return classOptions
    .map((cls) => {
      const rows = sourceTargets.map((item, index) => ({ ...item, index })).filter((item) => item.cls === cls);
      const total = rows.reduce((sum, item) => sum + item.target, 0);
      const meta = classMeta[cls] || classMeta["稳健"];
      return `
        <article class="target-edit-group is-${meta.tone}">
          <div class="target-edit-head">
            <div class="class-label">
              <div>
                <strong>${cls}</strong>
                <span>合计 ${Math.round(total * 100)}%</span>
              </div>
            </div>
            <button type="button" data-add-target="${cls}">新增小类</button>
          </div>
          <div class="target-edit-list">
            ${rows.map((item) => `
              <div class="target-edit-row">
                <input value="${item.type}" data-target-type="${item.index}" aria-label="${cls} 小类名称" autocomplete="off" />
                <label class="target-ratio-field">
                  <input value="${(item.target * 100).toFixed(0)}" inputmode="decimal" data-target-index="${item.index}" aria-label="${item.type} 目标比例" />
                  <span>%</span>
                </label>
                <button type="button" data-delete-target="${item.index}" aria-label="删除${item.type}">删除</button>
              </div>
            `).join("") || '<p class="muted target-empty">暂无小类，点击新增小类添加。</p>'}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecords() {
  document.querySelectorAll("[data-record-view]").forEach((button) => button.classList.toggle("active", button.dataset.recordView === state.recordView));
  const allRecords = state.recordView === "flow"
    ? state.flows.map((flow, index) => ({ ...flow, index, kind: "flow" })).sort((a, b) => b.date.localeCompare(a.date))
    : state.snapshots.map((snapshot, index) => ({ ...snapshot, index, kind: "snapshot" })).sort((a, b) => b.month.localeCompare(a.month));
  renderRecordMonthOptions(allRecords);
  const records = state.recordMonth === "all"
    ? allRecords
    : allRecords.filter((record) => recordMonthOf(record) === state.recordMonth);
  const totalPages = Math.max(1, Math.ceil(records.length / recordPageSize));
  state.recordPage = Math.min(Math.max(1, state.recordPage), totalPages);
  const pageRecords = records.slice((state.recordPage - 1) * recordPageSize, state.recordPage * recordPageSize);
  els.recordCount.textContent = `${records.length} 条`;
  els.recordList.innerHTML = pageRecords
    .map((record) => record.kind === "flow" ? renderFlowRecord(record) : renderSnapshotRecord(record))
    .join("");
  renderRecordPagination(records.length, totalPages);
}

function recordMonthOf(record) {
  return record.kind === "flow" ? record.date.slice(0, 7) : record.month;
}

function renderRecordMonthOptions(records) {
  const months = [...new Set(records.map(recordMonthOf))].sort((a, b) => b.localeCompare(a));
  if (state.recordMonth !== "all" && !months.includes(state.recordMonth)) state.recordMonth = "all";
  els.recordMonthOptions.innerHTML = [
    `<button type="button" class="${state.recordMonth === "all" ? "active" : ""}" data-record-month="all">全部</button>`,
    ...months.map((month) => `<button type="button" class="${state.recordMonth === month ? "active" : ""}" data-record-month="${month}">${month.slice(2)}</button>`),
  ].join("");
}

function renderRecordPagination(total, totalPages) {
  if (total <= recordPageSize) {
    els.recordPagination.innerHTML = "";
    return;
  }
  els.recordPagination.innerHTML = `
    <button type="button" ${state.recordPage === 1 ? "disabled" : ""} data-record-page="prev">上一页</button>
    <span>${state.recordPage} / ${totalPages}</span>
    <button type="button" ${state.recordPage === totalPages ? "disabled" : ""} data-record-page="next">下一页</button>
  `;
}

function renderFlowRecord(flow) {
  const isNegative = negativeOps.includes(flow.action);
  return `
    <article class="activity-item">
      <div class="activity-main act-body">
        <div class="activity-name act-name">${flow.platform} · ${flow.type}</div>
        <div class="activity-meta act-meta">${flow.date} / ${flow.action} / ${flow.note || "无备注"}</div>
      </div>
      <div class="stack-value act-right">
        <b class="act-amount ${isNegative ? "out negative" : "in positive"}">${isNegative ? "-" : "+"}${formatMoney(flow.amount)}</b>
        <div class="record-controls act-controls">
          <button class="record-action-button btn-sm btn-edit" type="button" data-edit-flow="${flow.index}">编辑</button>
          <button class="record-action-button btn-sm btn-del" type="button" data-delete-flow="${flow.index}">删除</button>
        </div>
      </div>
    </article>
  `;
}

function renderSnapshotRecord(snapshot) {
  const profit = snapshot.end - snapshot.start;
  return `
    <article class="activity-item">
      <div class="activity-main act-body">
        <div class="activity-name act-name">${snapshot.cls} · ${snapshot.type}</div>
        <div class="activity-meta act-meta">${snapshot.month} 快照 / 期初 ${formatMoney(snapshot.start)} / 期末 ${formatMoney(snapshot.end)}</div>
      </div>
      <div class="stack-value act-right">
        <b class="act-amount">${formatMoney(snapshot.end)}</b>
        <div class="record-controls act-controls">
          <button class="record-action-button btn-sm btn-edit" type="button" data-edit-snapshot="${snapshot.index}">编辑</button>
          <button class="record-action-button btn-sm btn-del" type="button" data-delete-snapshot="${snapshot.index}">删除</button>
        </div>
      </div>
    </article>
  `;
}

function renderTargets() {
  const sourceTargets = state.planEditMode === "targets" && state.draftTargets ? state.draftTargets : targets;
  if (state.planEditMode !== "targets") {
    els.targetPlanTitle.textContent = "目标配置";
    els.targetPlanDescription.textContent = `当前生效版本：${monthLabel(state.targetEffectiveMonth)}起`;
    els.targetPlanActions.innerHTML = '<button class="icon-edit-button" type="button" data-plan-edit="targets">编辑</button>';
    els.targetVersionNotice.innerHTML = `
      <div class="target-version-note">历史月份默认冻结，后续月份按最新目标版本计算</div>
    `;
    els.targetList.innerHTML = targetClassCards(sourceTargets);
    els.targetHistoryHelper.innerHTML = `
      <div>
        <span>历史月份默认冻结；如果某个月目标录入有误，可单独修正。</span>
        <button type="button" data-open-history-target>修正历史目标</button>
      </div>
    `;
    renderHistoryTargetModal();
    return;
  }
  els.targetPlanTitle.textContent = "编辑目标配置";
  els.targetPlanDescription.textContent = "修改后将作为新的生效版本应用到后续月份";
  els.targetPlanActions.innerHTML = '<button class="plan-action-button subtle" type="button" data-plan-cancel="targets">取消</button><button class="plan-action-button" type="button" data-plan-save="targets">保存</button>';
  els.targetVersionNotice.innerHTML = `
    <div class="target-edit-note">
      <b>生效月份：${monthLabel(state.targetEditEffectiveMonth)}</b>
      <span>影响范围：${monthLabel(state.targetEditEffectiveMonth)}及以后</span>
      <em>保存后仅影响后续月份，历史月份保持不变。</em>
    </div>
  `;
  els.targetHistoryHelper.innerHTML = "";
  els.targetList.innerHTML = targetClassCards(sourceTargets, { editable: true });
}

function historyMonths() {
  return monthOptions().filter((month) => month <= state.targetEffectiveMonth).slice(-5);
}

function renderHistoryTargetModal() {
  const months = historyMonths();
  if (!months.includes(state.historyTargetMonth)) state.historyTargetMonth = months.at(-1) || "2026-01";
  els.historyMonthOptions.innerHTML = months.map((month) => `
    <button type="button" class="${month === state.historyTargetMonth ? "active" : ""}" data-history-month="${month}">${month.slice(0, 4)}-${month.slice(5)}</button>
  `).join("");
  els.historyMonthLabel.textContent = `修正月份：${monthLabel(state.historyTargetMonth)}`;
  els.historyTargetList.innerHTML = targetClassCards(targets);
}

function renderMonthlyPlans() {
  const sourcePlans = state.planEditMode === "monthly" && state.draftMonthlyPlans ? state.draftMonthlyPlans : state.monthlyPlans;
  els.defaultPlanInput.value = sourcePlans["默认"] || 0;
  const years = monthlyPlanYears(sourcePlans);
  if (!years.includes(state.monthlyPlanYear)) state.monthlyPlanYear = years[0] || currentYear;
  const defaultAmount = sourcePlans["默认"] || 0;
  const overrides = Object.entries(sourcePlans)
    .filter(([month, amount]) => month !== "默认" && month.startsWith(state.monthlyPlanYear) && amount !== defaultAmount)
    .sort(([a], [b]) => a.localeCompare(b));
  els.monthlyPlanYearOptions.innerHTML = years.map((year) => `
    <button type="button" class="${year === state.monthlyPlanYear ? "active" : ""}" data-plan-year="${year}">${year}年</button>
  `).join("");
  els.monthlyPlanSummary.innerHTML = `
      <div class="plan-summary-row">
        <span>新增月份默认金额</span>
        <b>${formatMoney(defaultAmount)}</b>
      </div>
    ${overrides.map(([month, amount]) => `
      <div class="plan-summary-row plan-summary-row-muted">
        <span>${monthLabel(month)}</span>
        <b>${formatMoney(amount)}</b>
      </div>
    `).join("") || `<div class="plan-summary-row plan-summary-row-muted"><span>${state.monthlyPlanYear}年暂无特殊月份</span><b>默认生效</b></div>`}
  `;
  els.monthlyPlanActions.innerHTML = state.planEditMode === "monthly"
    ? '<button class="plan-action-button subtle" type="button" data-plan-cancel="monthly">取消</button><button class="plan-action-button" type="button" data-plan-save="monthly">保存</button>'
    : '<button class="icon-edit-button" type="button" data-plan-edit="monthly">编辑</button>';
  els.monthlyPlanEditor.classList.toggle("hidden", state.planEditMode !== "monthly");
  els.monthlyPlanList.classList.toggle("hidden", state.planEditMode !== "monthly");
  const editableMonths = monthOptions().filter((month) => month.startsWith(state.monthlyPlanYear));
  els.monthlyPlanList.innerHTML = editableMonths
    .map((month) => `
      <label class="month-plan-row">
        <span>${monthLabel(month)}</span>
        <input value="${month < currentMonth ? sourcePlans[month] ?? sourcePlans["默认"] ?? 0 : sourcePlans[month] ?? ""}" placeholder="${sourcePlans[month] ?? sourcePlans["默认"] ?? 0}" inputmode="decimal" data-plan-month="${month}" autocomplete="off" />
      </label>
    `)
    .join("");
}

function monthlyPlanYears(sourcePlans = state.monthlyPlans) {
  const years = new Set(monthOptions().map((month) => month.slice(0, 4)));
  Object.keys(sourcePlans)
    .filter((key) => key !== "默认")
    .forEach((month) => years.add(month.slice(0, 4)));
  return Array.from(years).sort();
}

function startPlanEdit(mode) {
  state.planEditMode = mode;
  state.draftMonthlyPlans = null;
  state.draftTargets = null;
  if (mode === "monthly") state.draftMonthlyPlans = { ...state.monthlyPlans };
  if (mode === "targets") state.draftTargets = targets.map((item) => ({ ...item }));
  renderAll();
}

function cancelPlanEdit(mode) {
  if (state.planEditMode !== mode) return;
  state.planEditMode = "";
  if (mode === "monthly") state.draftMonthlyPlans = null;
  if (mode === "targets") state.draftTargets = null;
  renderAll();
}

function saveMonthlyPlans() {
  if (state.planEditMode !== "monthly") return;
  const next = { ...state.monthlyPlans };
  next["默认"] = moneyNumber("#defaultPlanInput");
  document.querySelectorAll("[data-plan-month]").forEach((input) => {
    const value = input.value.trim();
    if (value) next[input.dataset.planMonth] = Number(value.replace(/[^\d.]/g, "")) || 0;
    else delete next[input.dataset.planMonth];
  });
  state.monthlyPlans = next;
  state.planEditMode = "";
  state.draftMonthlyPlans = null;
  renderAll();
}

function saveTargetPlans() {
  if (state.planEditMode !== "targets" || !state.draftTargets) return;
  const total = state.draftTargets.reduce((sum, item) => sum + item.target, 0);
  if (Math.round(total * 100) !== 100) {
    showValidation(`当前目标配置合计为 ${Math.round(total * 100)}%，请调整到 100% 后再保存。`);
    return;
  }
  targets.splice(0, targets.length, ...state.draftTargets.map((item) => ({ ...item })));
  state.planEditMode = "";
  state.draftTargets = null;
  renderRecordOptions();
  renderAll();
}

function renderView() {
  els.views.forEach((view) => view.classList.toggle("active", view.dataset.view === state.view));
  document.querySelectorAll("[data-nav]").forEach((button) => button.classList.toggle("active", button.dataset.nav === state.view));
  document.body.dataset.view = state.view;
  const titles = {
    overview: "投入与收益总览",
    record: "资产流水",
    plan: "资产配置计划",
    mine: "我的",
  };
  els.pageTitle.textContent = titles[state.view] || "投入与收益总览";
}

function renderMine() {
  els.accountPhoneLabel.textContent = state.currentAccount ? maskPhone(state.currentAccount) : "未登录";
  els.mineFlowCount.textContent = state.flows.length;
  els.mineSnapshotCount.textContent = state.snapshots.length;
  els.mineUseDays.textContent = useDays();
}

function showValidation(message) {
  pendingAlertConfirm = null;
  els.validationTitle.textContent = "配置比例需为 100%";
  els.validationMessage.textContent = message;
  els.validationCancel.classList.add("hidden");
  els.validationClose.textContent = "知道了";
  els.validationAlert.classList.remove("hidden");
}

function showConfirmAlert({ title, message, confirmText = "确认", cancelText = "取消", onConfirm }) {
  pendingAlertConfirm = onConfirm;
  els.validationTitle.textContent = title;
  els.validationMessage.textContent = message;
  els.validationCancel.textContent = cancelText;
  els.validationClose.textContent = confirmText;
  els.validationCancel.classList.remove("hidden");
  els.validationAlert.classList.remove("hidden");
}

function closeValidation() {
  els.validationAlert.classList.add("hidden");
  pendingAlertConfirm = null;
}

function openFlowModal(index = "") {
  els.flowModal.classList.remove("hidden");
  fillFlowForm(index);
  renderRecordType();
}

function openSnapshotModal(index = "") {
  els.snapshotModal.classList.remove("hidden");
  fillSnapshotForm(index);
  renderRecordType();
}

function closeFlowModal() {
  els.flowModal.classList.add("hidden");
  resetFlowForm();
  renderRecordType();
}

function closeSnapshotModal() {
  els.snapshotModal.classList.add("hidden");
  resetSnapshotForm();
  renderRecordType();
}

function resetRecordForms() {
  resetFlowForm();
  resetSnapshotForm();
}

function resetFlowForm() {
  els.flowForm.reset();
  els.flowForm.dataset.editIndex = "";
  document.querySelector("#flowDate").value = `${state.selectedMonth}-01`;
  const classes = [...new Set(targets.map((item) => item.cls))];
  setAppSelectOptions(els.flowPlatform, platforms);
  setAppSelectOptions(els.flowAction, ["投入", "取出"], "投入");
  setAppSelectOptions(els.flowClass, classes);
  renderAssetOptions(els.flowAsset, els.flowClass.value || classes[0]);
}

function resetSnapshotForm() {
  els.snapshotForm.reset();
  els.snapshotForm.dataset.editIndex = "";
  document.querySelector("#snapshotMonth").value = state.selectedMonth;
  const classes = [...new Set(targets.map((item) => item.cls))];
  setAppSelectOptions(els.snapshotClass, classes);
  renderAssetOptions(els.snapshotAsset, els.snapshotClass.value || classes[0]);
}

function fillFlowForm(index) {
  els.flowForm.dataset.editIndex = index;
  if (index === "") {
    resetFlowForm();
    return;
  }
  const flow = state.flows[Number(index)];
  document.querySelector("#flowDate").value = flow.date;
  setAppSelectOptions(els.flowPlatform, platforms, flow.platform);
  setAppSelectOptions(els.flowAction, ["投入", "取出"], flow.action);
  setAppSelectOptions(els.flowClass, [...new Set(targets.map((item) => item.cls))], flow.cls);
  renderAssetOptions(els.flowAsset, flow.cls, flow.type);
  document.querySelector("#flowTarget").value = flow.target;
  document.querySelector("#flowAmount").value = flow.amount;
  document.querySelector("#flowNote").value = flow.note;
}

function fillSnapshotForm(index) {
  els.snapshotForm.dataset.editIndex = index;
  if (index === "") {
    resetSnapshotForm();
    return;
  }
  const snapshot = state.snapshots[Number(index)];
  document.querySelector("#snapshotMonth").value = snapshot.month;
  setAppSelectOptions(els.snapshotClass, [...new Set(targets.map((item) => item.cls))], snapshot.cls);
  renderAssetOptions(els.snapshotAsset, snapshot.cls, snapshot.type);
  document.querySelector("#snapshotStart").value = snapshot.start;
  document.querySelector("#snapshotEnd").value = snapshot.end;
  document.querySelector("#snapshotNote").value = snapshot.note;
}

function renderAll() {
  persistAccountData();
  renderView();
  renderPeriodOptions();
  renderOverview();
  renderRecordType();
  renderRecords();
  renderMonthlyPlans();
  renderTargets();
  renderMine();
}

els.nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-nav]");
  if (!button) return;
  state.view = button.dataset.nav;
  renderAll();
});

els.yearOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-year-option]");
  if (!button) return;
  state.selectedYear = button.dataset.yearOption;
  state.selectedMonthFilter = "all";
  renderAll();
});

els.monthOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-month-option]");
  if (!button) return;
  const value = button.dataset.monthOption;
  if (value === "all") {
    state.selectedMonthFilter = "all";
  } else {
    state.selectedMonthFilter = "month";
    state.selectedMonth = value;
    state.selectedYear = value.slice(0, 4);
  }
  renderAll();
});

els.planScopeTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan-scope]");
  if (!button) return;
  state.planScope = button.dataset.planScope;
  renderAll();
});

els.recordViewTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-view]");
  if (!button) return;
  state.recordView = button.dataset.recordView;
  state.recordMonth = "all";
  state.recordPage = 1;
  renderAll();
});

els.recordMonthOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-month]");
  if (!button) return;
  state.recordMonth = button.dataset.recordMonth;
  state.recordPage = 1;
  renderAll();
});

els.recordPagination.addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-page]");
  if (!button) return;
  if (button.dataset.recordPage === "prev") state.recordPage -= 1;
  if (button.dataset.recordPage === "next") state.recordPage += 1;
  renderAll();
});

els.donut.addEventListener("click", (event) => {
  const entry = pickAllocationEntry(event);
  if (entry) renderAllocationPopover(entry);
});

els.donut.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key) || !state.allocationEntries.length) return;
  event.preventDefault();
  renderAllocationPopover(state.allocationEntries[0]);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".donut-wrap")) return;
  els.allocationPopover.classList.add("hidden");
});

els.monthlyPlanActions.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-plan-edit]");
  const cancel = event.target.closest("[data-plan-cancel]");
  const save = event.target.closest("[data-plan-save]");
  if (edit) startPlanEdit(edit.dataset.planEdit);
  if (cancel) cancelPlanEdit(cancel.dataset.planCancel);
  if (save) saveMonthlyPlans();
});

els.monthlyPlanYearOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan-year]");
  if (!button) return;
  state.monthlyPlanYear = button.dataset.planYear;
  renderAll();
});

els.targetPlanActions.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-plan-edit]");
  const cancel = event.target.closest("[data-plan-cancel]");
  const save = event.target.closest("[data-plan-save]");
  if (edit) startPlanEdit(edit.dataset.planEdit);
  if (cancel) cancelPlanEdit(cancel.dataset.planCancel);
  if (save) saveTargetPlans();
});

function openHistoryTargetModal() {
  renderHistoryTargetModal();
  els.historyTargetModal.classList.remove("hidden");
}

function closeHistoryTargetModal() {
  els.historyTargetModal.classList.add("hidden");
}

els.targetHistoryHelper.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-history-target]")) openHistoryTargetModal();
});

els.historyMonthOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-month]");
  if (!button) return;
  state.historyTargetMonth = button.dataset.historyMonth;
  renderHistoryTargetModal();
});

els.closeHistoryTarget.addEventListener("click", closeHistoryTargetModal);
els.cancelHistoryTarget.addEventListener("click", closeHistoryTargetModal);
els.confirmHistoryTarget.addEventListener("click", closeHistoryTargetModal);
els.historyTargetModal.addEventListener("click", (event) => {
  if (event.target === els.historyTargetModal) closeHistoryTargetModal();
});

els.targetList.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add-target]");
  const remove = event.target.closest("[data-delete-target]");
  if (state.planEditMode !== "targets" || !state.draftTargets) return;
  if (add) {
    state.draftTargets.push({ cls: add.dataset.addTarget, type: "新资产小类", target: 0 });
    renderAll();
  }
  if (remove) {
    state.draftTargets.splice(Number(remove.dataset.deleteTarget), 1);
    renderAll();
  }
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".app-select-trigger");
  const option = event.target.closest("[data-select-option]");
  if (trigger) {
    const select = trigger.closest(".app-select");
    const opening = !select.classList.contains("open");
    closeAppSelects(select);
    select.classList.toggle("open", opening);
    trigger.setAttribute("aria-expanded", String(opening));
    return;
  }
  if (option) {
    event.preventDefault();
    event.stopPropagation();
    const select = option.closest(".app-select");
    const input = select.querySelector("input");
    const options = Array.from(select.querySelectorAll("[data-select-option]")).map((button) => button.dataset.selectOption);
    input.value = option.dataset.selectOption;
    select.classList.remove("open");
    select.querySelector(".app-select-trigger").setAttribute("aria-expanded", "false");
    closeAppSelects();
    setAppSelectOptions(input, options, input.value);
    input.closest(".app-select").classList.remove("open");
    input.closest(".app-select").querySelector(".app-select-trigger").setAttribute("aria-expanded", "false");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (!event.target.closest(".app-select")) closeAppSelects();
});

els.flowClass.addEventListener("change", () => {
  renderAssetOptions(els.flowAsset, els.flowClass.value);
});

els.snapshotClass.addEventListener("change", () => {
  renderAssetOptions(els.snapshotAsset, els.snapshotClass.value);
});

els.openFlowButton.addEventListener("click", () => openFlowModal());

els.openSnapshotButton.addEventListener("click", () => openSnapshotModal());

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.closeModal === "flow") closeFlowModal();
    if (button.dataset.closeModal === "snapshot") closeSnapshotModal();
  });
});

els.flowModal.addEventListener("click", (event) => {
  if (event.target === els.flowModal) closeFlowModal();
});

els.snapshotModal.addEventListener("click", (event) => {
  if (event.target === els.snapshotModal) closeSnapshotModal();
});

els.recordList.addEventListener("click", (event) => {
  const editFlow = event.target.closest("[data-edit-flow]");
  const deleteFlow = event.target.closest("[data-delete-flow]");
  const editSnapshot = event.target.closest("[data-edit-snapshot]");
  const deleteSnapshot = event.target.closest("[data-delete-snapshot]");

  if (editFlow) openFlowModal(editFlow.dataset.editFlow);
  if (editSnapshot) openSnapshotModal(editSnapshot.dataset.editSnapshot);
  if (deleteFlow) {
    state.flows.splice(Number(deleteFlow.dataset.deleteFlow), 1);
    state.recordPage = 1;
    renderAll();
  }
  if (deleteSnapshot) {
    state.snapshots.splice(Number(deleteSnapshot.dataset.deleteSnapshot), 1);
    state.recordPage = 1;
    renderAll();
  }
});

els.flowForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = moneyNumber("#flowAmount");
  if (!amount) return document.querySelector("#flowAmount").focus();
  const data = {
    date: document.querySelector("#flowDate").value,
    platform: els.flowPlatform.value,
    cls: els.flowClass.value,
    type: els.flowAsset.value,
    target: document.querySelector("#flowTarget").value.trim(),
    action: els.flowAction.value,
    amount,
    note: document.querySelector("#flowNote").value.trim(),
  };
  const editIndex = els.flowForm.dataset.editIndex;
  if (editIndex === "") state.flows.unshift(data);
  else state.flows[Number(editIndex)] = data;
  state.recordView = "flow";
  state.recordMonth = "all";
  state.recordPage = 1;
  closeFlowModal();
  renderAll();
});

els.snapshotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const month = document.querySelector("#snapshotMonth").value;
  const cls = els.snapshotClass.value;
  const type = els.snapshotAsset.value;
  const existing = state.snapshots.find((row) => row.month === month && row.cls === cls && row.type === type);
  const data = {
    month,
    cls,
    type,
    start: moneyNumber("#snapshotStart"),
    end: moneyNumber("#snapshotEnd"),
    note: document.querySelector("#snapshotNote").value.trim(),
  };
  const editIndex = els.snapshotForm.dataset.editIndex;
  if (editIndex !== "") state.snapshots[Number(editIndex)] = data;
  else if (existing) Object.assign(existing, data);
  else state.snapshots.unshift(data);
  state.recordView = "snapshot";
  state.recordMonth = "all";
  state.recordPage = 1;
  closeSnapshotModal();
  renderAll();
});

els.defaultPlanInput.addEventListener("input", () => {
  if (state.planEditMode !== "monthly" || !state.draftMonthlyPlans) return;
  state.draftMonthlyPlans["默认"] = moneyNumber("#defaultPlanInput");
});

els.monthlyPlanList.addEventListener("input", (event) => {
  const input = event.target.closest("[data-plan-month]");
  if (!input || state.planEditMode !== "monthly" || !state.draftMonthlyPlans) return;
  const value = input.value.trim();
  if (value) state.draftMonthlyPlans[input.dataset.planMonth] = Number(value.replace(/[^\d.]/g, "")) || 0;
  else delete state.draftMonthlyPlans[input.dataset.planMonth];
});

function updateDraftTarget(event) {
  const ratioInput = event.target.closest("[data-target-index]");
  const typeInput = event.target.closest("[data-target-type]");
  if (state.planEditMode !== "targets" || !state.draftTargets) return;
  if (ratioInput) {
    const index = Number(ratioInput.dataset.targetIndex);
    const value = Number(ratioInput.value.replace(/[^\d.]/g, "")) || 0;
    state.draftTargets[index].target = value / 100;
    if (event.type === "change") renderAll();
    return;
  }
  if (typeInput) {
    state.draftTargets[Number(typeInput.dataset.targetType)].type = typeInput.value.trim() || "未命名小类";
  }
}

els.targetList.addEventListener("input", updateDraftTarget);
els.targetList.addEventListener("change", updateDraftTarget);

els.sendCodeButton.addEventListener("click", () => {
  const phone = els.phoneInput.value.trim();
  if (!/^1\d{10}$/.test(phone)) {
    els.authTip.textContent = "请输入 11 位中国大陆手机号。";
    els.phoneInput.focus();
    return;
  }
  state.loginCode = "123456";
  els.authTip.textContent = "模拟验证码：123456。接入短信服务后这里会改为真实发送。";
});

els.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const phone = els.phoneInput.value.trim();
  const code = els.codeInput.value.trim();
  if (!/^1\d{10}$/.test(phone)) {
    els.authTip.textContent = "请输入 11 位中国大陆手机号。";
    els.phoneInput.focus();
    return;
  }
  if (code !== state.loginCode) {
    els.authTip.textContent = "验证码不正确，请重新输入。原型验证码为 123456。";
    els.codeInput.focus();
    return;
  }
  login(phone);
});

els.accountButton.addEventListener("click", () => {
  state.view = "mine";
  renderAll();
});

els.heroPrivacyButton.addEventListener("click", () => {
  state.amountVisible = !state.amountVisible;
  els.heroPrivacyButton.classList.toggle("is-hidden", !state.amountVisible);
  els.heroPrivacyButton.setAttribute("aria-label", state.amountVisible ? "隐藏金额" : "显示金额");
  els.heroPrivacyButton.setAttribute("aria-pressed", String(!state.amountVisible));
  renderOverview();
});

els.logoutButton.addEventListener("click", () => {
  showConfirmAlert({
    title: "退出当前账号？",
    message: "退出后仍可用手机号重新登录，本机已保存的数据不会被删除。",
    confirmText: "退出登录",
    onConfirm: logout,
  });
});

els.validationClose.addEventListener("click", () => {
  const confirm = pendingAlertConfirm;
  closeValidation();
  if (confirm) confirm();
});

els.validationCancel.addEventListener("click", closeValidation);

els.validationAlert.addEventListener("click", (event) => {
  if (event.target === els.validationAlert) closeValidation();
});

const savedAccount = localStorage.getItem(sessionKey);
if (savedAccount) login(savedAccount);
else {
  setAuthVisible(true);
  renderRecordOptions();
  renderAll();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
