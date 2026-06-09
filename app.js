const LOCAL_KEY = "wc2026-local-config-v2";

const defaultMembers = [
  "Nguyễn Đức Đông",
  "Phan Phước Gia",
  "Bùi Hoàng Duy",
  "Lê Minh Vũ",
  "Vũ Hồng Cường",
  "Nguyễn Đức Toàn",
  "Bùi Trung Kiên",
  "Phạm Quốc Huy",
  "Đỗ Thị Lành",
  "Phạm Hồng Cường",
  "Lại Cao Khiêm",
  "Nguyễn Văn Chiến",
  "Trần Thanh Hải",
  "Phùng Hoài Anh",
  "Nguyễn Đình Chức",
];

const defaultSettings = {
  exactPoints: 3,
  outcomePoints: 1,
  wrongPenalty: 0,
  missedPenalty: 0,
  matchFee: 30000,
  resultsUrl: "",
  reminderTime: "09:00",
};

const costRows = [
  { label: "Số trận vòng bảng", matches: 72 },
  { label: "Vòng 32 Đội", matches: 16 },
  { label: "Vòng 16 Đội", matches: 8 },
  { label: "Tứ kết", matches: 4 },
  { label: "Bán kết", matches: 2 },
  { label: "Hạng 3", matches: 1 },
  { label: "Chung Kết", matches: 1 },
];

const fixedPrizeRows = [
  { label: "Nhà Vô địch World Cup 2026", valueLabel: "Tổng Giá trị 1.000.000 VNĐ", amount: 1000000 },
  {
    label: "Quả bóng Vàng (Golden Ball): Cầu thủ xuất sắc nhất giải đấu",
    valueLabel: "Tổng Giá trị 1.000.000 VNĐ",
    amount: 1000000,
  },
  {
    label: "Chiếc giày Vàng (Golden Boot): Vua phá lưới",
    valueLabel: "Tổng Giá trị 1.000.000 VNĐ",
    amount: 1000000,
  },
  {
    label: "Găng tay Vàng (Golden Glove): Thủ môn xuất sắc nhất",
    valueLabel: "Tổng Giá trị 1.000.000 VNĐ",
    amount: 1000000,
  },
  {
    label: "Giải phong cách (FIFA Fair Play Trophy): Đội bóng có lối chơi và hành vi đẹp nhất giải",
    valueLabel: "Tổng Giá trị 1.000.000 VNĐ",
    amount: 1000000,
  },
];

let matches = [];
let state = {
  members: defaultMembers,
  currentMember: defaultMembers[0],
  predictions: {},
  results: {},
  settings: { ...defaultSettings },
  lastReminderDate: "",
};
let localConfig = loadLocalConfig();

const els = {
  seasonMeta: document.querySelector("#seasonMeta"),
  memberSelect: document.querySelector("#memberSelect"),
  apiStatus: document.querySelector("#apiStatus"),
  notifyBtn: document.querySelector("#notifyBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  stats: document.querySelector("#stats"),
  upcomingMatches: document.querySelector("#upcomingMatches"),
  reminderList: document.querySelector("#reminderList"),
  dashboardSearch: document.querySelector("#dashboardSearch"),
  predictSearch: document.querySelector("#predictSearch"),
  predictFilter: document.querySelector("#predictFilter"),
  predictionList: document.querySelector("#predictionList"),
  resultSearch: document.querySelector("#resultSearch"),
  resultList: document.querySelector("#resultList"),
  syncResultsBtn: document.querySelector("#syncResultsBtn"),
  leaderboardRows: document.querySelector("#leaderboardRows"),
  exportBtn: document.querySelector("#exportBtn"),
  exportSettingsBtn: document.querySelector("#exportSettingsBtn"),
  personalTitle: document.querySelector("#personalTitle"),
  personalFilter: document.querySelector("#personalFilter"),
  personalList: document.querySelector("#personalList"),
  membersInput: document.querySelector("#membersInput"),
  saveMembersBtn: document.querySelector("#saveMembersBtn"),
  exactPoints: document.querySelector("#exactPoints"),
  outcomePoints: document.querySelector("#outcomePoints"),
  wrongPenalty: document.querySelector("#wrongPenalty"),
  missedPenalty: document.querySelector("#missedPenalty"),
  matchFee: document.querySelector("#matchFee"),
  resultsUrl: document.querySelector("#resultsUrl"),
  reminderTime: document.querySelector("#reminderTime"),
  apiUrl: document.querySelector("#apiUrl"),
  saveSettingsBtn: document.querySelector("#saveSettingsBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  costRows: document.querySelector("#costRows"),
  prizeRows: document.querySelector("#prizeRows"),
  prizeTotal: document.querySelector("#prizeTotal"),
};

init();

async function init() {
  matches = await loadMatches();
  bindEvents();
  await refreshSharedState();
  maybeDailyReminder();
  window.setInterval(maybeDailyReminder, 60 * 1000);
}

async function loadMatches() {
  try {
    const response = await fetch("data/matches.json");
    if (!response.ok) throw new Error("Cannot load matches");
    return await response.json();
  } catch {
    els.seasonMeta.textContent =
      "Không tải được data/matches.json. Khi deploy GitHub Pages, file này phải nằm cùng thư mục data.";
    return [];
  }
}

function loadLocalConfig() {
  const saved = localStorage.getItem(LOCAL_KEY);
  if (!saved) return { apiUrl: "", currentMember: defaultMembers[0], lastReminderDate: "" };
  return { apiUrl: "", currentMember: defaultMembers[0], lastReminderDate: "", ...JSON.parse(saved) };
}

function saveLocalConfig() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(localConfig));
}

async function refreshSharedState() {
  if (!localConfig.apiUrl) {
    state.currentMember = localConfig.currentMember || state.currentMember;
    setApiStatus("Chưa kết nối Google Sheets", "warn");
    renderAll();
    return;
  }

  try {
    setApiStatus("Đang đồng bộ...", "");
    const remote = await apiCall("getState");
    state.members = remote.members?.length ? remote.members : defaultMembers;
    state.predictions = remote.predictions || {};
    state.results = remote.results || {};
    state.settings = { ...defaultSettings, ...(remote.settings || {}) };
    state.currentMember = state.members.includes(localConfig.currentMember)
      ? localConfig.currentMember
      : state.members[0];
    setApiStatus("Đã kết nối Google Sheets", "good");
  } catch (error) {
    setApiStatus("Không kết nối được Apps Script", "warn");
    console.error(error);
  }
  renderAll();
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${button.dataset.tab}`).classList.add("active");
      renderAll();
    });
  });

  els.memberSelect.addEventListener("change", () => {
    state.currentMember = els.memberSelect.value;
    localConfig.currentMember = state.currentMember;
    saveLocalConfig();
    renderAll();
  });
  els.dashboardSearch.addEventListener("input", renderDashboard);
  els.predictSearch.addEventListener("input", renderPredictions);
  els.predictFilter.addEventListener("change", renderPredictions);
  els.resultSearch.addEventListener("input", renderResults);
  els.personalFilter.addEventListener("change", renderPersonal);
  els.notifyBtn.addEventListener("click", requestNotifications);
  els.refreshBtn.addEventListener("click", refreshSharedState);
  els.syncResultsBtn.addEventListener("click", syncResults);
  els.exportBtn.addEventListener("click", exportState);
  els.exportSettingsBtn.addEventListener("click", exportState);
  els.saveMembersBtn.addEventListener("click", saveMembers);
  els.saveSettingsBtn.addEventListener("click", saveSettings);
  els.resetBtn.addEventListener("click", resetVotes);
}

function renderAll() {
  renderMemberSelect();
  renderHeader();
  renderDashboard();
  renderPredictions();
  renderResults();
  renderLeaderboard();
  renderPersonal();
  renderSettings();
  renderFinance();
}

function renderHeader() {
  const scored = Object.keys(state.results).length;
  const source = localConfig.apiUrl ? "Google Sheets" : "dữ liệu mẫu cục bộ";
  els.seasonMeta.textContent = `${matches.length} trận từ file Excel, ${state.members.length} thành viên, ${scored} trận đã có kết quả · ${source}`;
}

function renderMemberSelect() {
  els.memberSelect.innerHTML = "";
  state.members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    els.memberSelect.append(option);
  });
  if (!state.members.includes(state.currentMember)) state.currentMember = state.members[0] || "";
  els.memberSelect.value = state.currentMember;
}

function renderDashboard() {
  const predictionsCount = Object.values(state.predictions).reduce(
    (sum, byMatch) => sum + Object.keys(byMatch).length,
    0
  );
  const finance = financeSummary();
  els.stats.innerHTML = [
    stat("Trận", matches.length),
    stat("Lượt dự đoán", predictionsCount),
    stat("Tổng thu", formatMoney(finance.entryPool)),
    stat("Giải cố định", formatMoney(finance.fixedPrize)),
  ].join("");

  const query = norm(els.dashboardSearch.value);
  const upcoming = matches
    .filter((match) => !state.results[match.id])
    .filter((match) => matchText(match).includes(query))
    .slice(0, 12);
  renderList(els.upcomingMatches, upcoming, (match) => matchCard(match, "summary"));

  const missing = missingForMember(state.currentMember, nextReminderMatches());
  renderList(
    els.reminderList,
    missing,
    (match) => `<div class="personal-row"><strong>#${match.number} ${escapeHtml(match.team1)} - ${escapeHtml(match.team2)}</strong><span>${formatDate(match.kickoffVietnam)}</span></div>`,
    "Không có trận cần nhắc cho thành viên hiện tại."
  );
}

function renderPredictions() {
  const member = state.currentMember;
  const query = norm(els.predictSearch.value);
  const filter = els.predictFilter.value;
  let list = matches.filter((match) => matchText(match).includes(query));
  if (filter === "open") list = list.filter(isOpen);
  if (filter === "missing") list = list.filter((match) => !getPrediction(member, match.id));
  if (filter === "scored") list = list.filter((match) => state.results[match.id]);
  renderList(els.predictionList, list, (match) => matchCard(match, "predict"));
}

function renderResults() {
  const query = norm(els.resultSearch.value);
  const list = matches.filter((match) => matchText(match).includes(query));
  renderList(els.resultList, list, (match) => matchCard(match, "result"));
}

function renderLeaderboard() {
  const rows = calculateLeaderboard();
  els.leaderboardRows.innerHTML = rows
    .map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(row.name)}</strong></td>
        <td>${row.points}</td>
        <td>${row.exact}</td>
        <td>${row.outcome}</td>
        <td>${row.wrong}</td>
        <td>${row.missed}</td>
        <td>${formatMoney(row.money)}</td>
      </tr>`
    )
    .join("");
}

function renderFinance() {
  if (!els.costRows || !els.prizeRows || !els.prizeTotal) return;
  const fee = Number(state.settings.matchFee || defaultSettings.matchFee);
  const memberCount = state.members.length;
  const totalMatches = costRows.reduce((sum, row) => sum + row.matches, 0);
  const entryPool = totalMatches * fee * memberCount;
  const fixedPrizeTotal = fixedPrizeRows.reduce((sum, row) => sum + row.amount, 0);

  els.costRows.innerHTML = [
    ...costRows.map(
      (row) => `<tr>
        <td>${escapeHtml(row.label)}</td>
        <td>${row.matches}</td>
        <td>${memberCount}</td>
        <td>${formatMoney(fee)}</td>
        <td>${formatMoney(row.matches * fee * memberCount)}</td>
      </tr>`
    ),
    `<tr class="total-row"><td>Tổng</td><td>${totalMatches}</td><td>${memberCount}</td><td></td><td>${formatMoney(entryPool)}</td></tr>`,
  ].join("");

  els.prizeRows.innerHTML = fixedPrizeRows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(row.label)}</strong></td>
        <td>${escapeHtml(row.valueLabel)}</td>
      </tr>`
    )
    .join("");
  els.prizeTotal.textContent = formatMoney(fixedPrizeTotal);
}

function renderPersonal() {
  const member = state.currentMember;
  const filter = els.personalFilter.value;
  els.personalTitle.textContent = `Dự đoán cá nhân: ${member}`;
  let rows = matches.map((match) => ({ match, score: scorePrediction(member, match) }));
  if (filter === "win") rows = rows.filter((row) => row.score.points > 0);
  if (filter === "wrong") rows = rows.filter((row) => row.score.status === "wrong");
  if (filter === "missing") rows = rows.filter((row) => row.score.status === "missing");
  renderList(
    els.personalList,
    rows,
    ({ match, score }) => {
      const prediction = getPrediction(member, match.id);
      const result = state.results[match.id];
      return `<div class="personal-row">
        <div>
          <strong>#${match.number} ${escapeHtml(match.team1)} - ${escapeHtml(match.team2)}</strong>
          <div class="muted">${formatDate(match.kickoffVietnam)} · ${escapeHtml(match.venue)}</div>
        </div>
        <span>${prediction ? `${prediction.score1} - ${prediction.score2}` : "Chưa dự đoán"}</span>
        <span class="pill ${score.points > 0 ? "good" : score.status === "wrong" ? "warn" : ""}">
          ${result ? `${result.score1} - ${result.score2} · ${score.points} điểm` : "Chờ kết quả"}
        </span>
      </div>`;
    },
    "Chưa có dữ liệu phù hợp."
  );
}

function renderSettings() {
  els.membersInput.value = state.members.join("\n");
  els.apiUrl.value = localConfig.apiUrl || "";
  Object.keys(defaultSettings).forEach((key) => {
    if (els[key]) els[key].value = state.settings[key] ?? "";
  });
}

function matchCard(match, mode) {
  const prediction = getPrediction(state.currentMember, match.id);
  const result = state.results[match.id];
  const status = result ? "Đã có kết quả" : isOpen(match) ? "Còn mở" : "Đã qua giờ";
  const statusClass = result ? "good" : isOpen(match) ? "" : "warn";
  let body = "";

  if (mode === "predict") {
    const disabled = !isOpen(match) && !prediction ? "disabled" : "";
    body = `
      <div class="score-box">
        <input ${disabled} min="0" type="number" value="${prediction?.score1 ?? ""}" data-pred="${match.id}" data-side="score1" placeholder="0" />
        <span>-</span>
        <input ${disabled} min="0" type="number" value="${prediction?.score2 ?? ""}" data-pred="${match.id}" data-side="score2" placeholder="0" />
      </div>
      <button type="button" data-save-pred="${match.id}" ${disabled}>Lưu dự đoán</button>
      <span class="muted">${prediction ? "Đã lưu" : "Chưa dự đoán"}</span>`;
  } else if (mode === "result") {
    body = `
      <div class="score-box">
        <input min="0" type="number" value="${result?.score1 ?? ""}" data-result="${match.id}" data-side="score1" placeholder="0" />
        <span>-</span>
        <input min="0" type="number" value="${result?.score2 ?? ""}" data-result="${match.id}" data-side="score2" placeholder="0" />
      </div>
      <button type="button" data-save-result="${match.id}">Lưu kết quả</button>
      <button class="secondary" type="button" data-clear-result="${match.id}">Xóa</button>`;
  } else {
    const missing = missingCount(match);
    body = `<span class="pill">${state.members.length - missing}/${state.members.length} đã dự đoán</span>`;
  }

  return `<article class="match-card">
    <div class="match-meta">
      <span class="pill">#${match.number}</span>
      <span class="pill ${statusClass}">${status}</span>
      <span>${formatDate(match.kickoffVietnam)}</span>
      <span>${escapeHtml(match.venue)}</span>
    </div>
    <div class="teams">
      <span>${escapeHtml(match.team1)}</span>
      <strong>${result ? `${result.score1} - ${result.score2}` : "vs"}</strong>
      <span>${escapeHtml(match.team2)}</span>
    </div>
    <div class="card-body">${body}</div>
  </article>`;
}

document.addEventListener("click", (event) => {
  const predId = event.target.dataset.savePred;
  if (predId) savePrediction(predId);
  const resultId = event.target.dataset.saveResult;
  if (resultId) saveResult(resultId);
  const clearId = event.target.dataset.clearResult;
  if (clearId) clearResult(clearId);
});

async function savePrediction(matchId) {
  if (!requireApi()) return;
  const inputs = [...document.querySelectorAll(`[data-pred="${matchId}"]`)];
  const score1 = numberFromInput(inputs.find((input) => input.dataset.side === "score1"));
  const score2 = numberFromInput(inputs.find((input) => input.dataset.side === "score2"));
  if (score1 === null || score2 === null) return alert("Nhập đủ tỉ số dự đoán.");
  await apiCall("savePrediction", { matchId, member: state.currentMember, score1, score2 });
  await refreshSharedState();
}

async function saveResult(matchId) {
  if (!requireApi()) return;
  const inputs = [...document.querySelectorAll(`[data-result="${matchId}"]`)];
  const score1 = numberFromInput(inputs.find((input) => input.dataset.side === "score1"));
  const score2 = numberFromInput(inputs.find((input) => input.dataset.side === "score2"));
  if (score1 === null || score2 === null) return alert("Nhập đủ tỉ số kết quả.");
  await apiCall("saveResult", { matchId, score1, score2 });
  await refreshSharedState();
}

async function clearResult(matchId) {
  if (!requireApi()) return;
  await apiCall("clearResult", { matchId });
  await refreshSharedState();
}

function calculateLeaderboard() {
  return state.members
    .map((member) => {
      const total = matches.reduce(
        (acc, match) => {
          const score = scorePrediction(member, match);
          acc.points += score.points;
          acc[score.status] = (acc[score.status] || 0) + (score.counted ? 1 : 0);
          return acc;
        },
        { name: member, points: 0, money: memberFee(member), exact: 0, outcome: 0, wrong: 0, missed: 0 }
      );
      return total;
    })
    .sort((a, b) => b.points - a.points || a.money - b.money || a.name.localeCompare(b.name));
}

function scorePrediction(member, match) {
  const result = state.results[match.id];
  if (!result) return { status: "pending", points: 0, counted: false };
  const prediction = getPrediction(member, match.id);
  if (!prediction) {
    return {
      status: "missed",
      points: Number(state.settings.missedPenalty),
      counted: true,
    };
  }
  if (prediction.score1 === result.score1 && prediction.score2 === result.score2) {
    return { status: "exact", points: Number(state.settings.exactPoints), counted: true };
  }
  if (outcome(prediction.score1, prediction.score2) === outcome(result.score1, result.score2)) {
    return { status: "outcome", points: Number(state.settings.outcomePoints), counted: true };
  }
  return {
    status: "wrong",
    points: Number(state.settings.wrongPenalty),
    counted: true,
  };
}

function memberFee(member) {
  const predicted = matches.filter((match) => getPrediction(member, match.id)).length;
  return predicted * Number(state.settings.matchFee || defaultSettings.matchFee);
}

function financeSummary() {
  const fee = Number(state.settings.matchFee || defaultSettings.matchFee);
  const totalMatches = costRows.reduce((sum, row) => sum + row.matches, 0);
  const entryPool = totalMatches * fee * state.members.length;
  const fixedPrize = fixedPrizeRows.reduce((sum, row) => sum + row.amount, 0);
  return {
    entryPool,
    fixedPrize,
    totalPrize: fixedPrize,
  };
}

function getPrediction(member, matchId) {
  return state.predictions[matchId]?.[member];
}

function missingCount(match) {
  return state.members.filter((member) => !getPrediction(member, match.id)).length;
}

function missingForMember(member, list) {
  return list.filter((match) => !getPrediction(member, match.id));
}

function nextReminderMatches() {
  const now = new Date();
  const soon = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  return matches.filter((match) => {
    const kickoff = new Date(match.kickoffVietnam);
    return kickoff >= now && kickoff <= soon && !state.results[match.id];
  });
}

function todayMatches() {
  const today = new Date().toISOString().slice(0, 10);
  return matches.filter((match) => match.kickoffVietnam?.slice(0, 10) === today);
}

function isOpen(match) {
  if (!match.kickoffVietnam) return true;
  return new Date(match.kickoffVietnam).getTime() > Date.now();
}

function outcome(a, b) {
  if (a > b) return "home";
  if (a < b) return "away";
  return "draw";
}

async function syncResults() {
  if (!state.settings.resultsUrl) {
    alert("Hãy nhập URL kết quả JSON trong Cài đặt trước.");
    return;
  }
  if (!requireApi()) return;
  try {
    const response = await fetch(state.settings.resultsUrl);
    if (!response.ok) throw new Error("Cannot fetch results");
    const rows = await response.json();
    for (const row of rows) {
      const match = matches.find((item) => item.number === Number(row.number) || item.id === row.id);
      if (!match) continue;
      if (Number.isInteger(Number(row.score1)) && Number.isInteger(Number(row.score2))) {
        await apiCall("saveResult", {
          matchId: match.id,
          score1: Number(row.score1),
          score2: Number(row.score2),
        });
      }
    }
    await refreshSharedState();
    alert("Đã cập nhật kết quả và tính lại điểm.");
  } catch {
    alert("Không cập nhật được. Kiểm tra URL JSON.");
  }
}

async function saveMembers() {
  if (!requireApi()) return;
  const members = els.membersInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!members.length) return alert("Danh sách thành viên không được trống.");
  await apiCall("saveMembers", { members: JSON.stringify(members) });
  await refreshSharedState();
}

async function saveSettings() {
  const nextApiUrl = els.apiUrl.value.trim();
  localConfig.apiUrl = nextApiUrl;
  localConfig.currentMember = state.currentMember;
  saveLocalConfig();

  if (!nextApiUrl) {
    setApiStatus("Chưa kết nối Google Sheets", "warn");
    alert("Đã lưu cấu hình cục bộ. Hãy dán URL Web App Apps Script để đồng bộ Google Sheets.");
    renderAll();
    return;
  }

  const settings = {};
  Object.keys(defaultSettings).forEach((key) => {
    settings[key] =
      els[key]?.type === "number" ? Number(els[key].value || 0) : els[key]?.value ?? defaultSettings[key];
  });
  await apiCall("saveSettings", { settings: JSON.stringify(settings) });
  await refreshSharedState();
}

function exportState() {
  const payload = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "worldcup-2026-predictions.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function resetVotes() {
  if (!requireApi()) return;
  if (!confirm("Xóa toàn bộ dự đoán và kết quả đang lưu trong Google Sheets?")) return;
  await apiCall("resetVotes");
  await refreshSharedState();
}

function requestNotifications() {
  if (!("Notification" in window)) {
    alert("Trình duyệt này không hỗ trợ thông báo desktop.");
    return;
  }
  Notification.requestPermission().then((permission) => {
    alert(permission === "granted" ? "Đã bật nhắc desktop." : "Chưa cấp quyền thông báo.");
  });
}

function maybeDailyReminder() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hhmm = now.toTimeString().slice(0, 5);
  if (localConfig.lastReminderDate === today || hhmm < state.settings.reminderTime) return;
  const missing = missingForMember(state.currentMember, nextReminderMatches());
  if (!missing.length) return;
  localConfig.lastReminderDate = today;
  saveLocalConfig();
  const message = `${state.currentMember} còn ${missing.length} trận cần dự đoán trong 36 giờ tới.`;
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Nhắc dự đoán World Cup 2026", { body: message });
  } else {
    alert(message);
  }
}

function apiCall(action, params = {}) {
  return new Promise((resolve, reject) => {
    const apiUrl = localConfig.apiUrl?.trim();
    if (!apiUrl) return reject(new Error("Missing Apps Script URL"));

    const callbackName = `wcApi_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const url = new URL(apiUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Apps Script timeout"));
    }, 20000);

    window[callbackName] = (payload) => {
      cleanup();
      if (payload?.ok === false) reject(new Error(payload.error || "Apps Script error"));
      else resolve(payload?.data ?? payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Cannot load Apps Script"));
    };
    script.src = url.toString();
    document.body.append(script);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }
  });
}

function requireApi() {
  if (localConfig.apiUrl) return true;
  alert("Hãy vào Cài đặt và dán URL Web App Apps Script trước.");
  return false;
}

function setApiStatus(text, type) {
  els.apiStatus.textContent = text;
  els.apiStatus.className = `pill ${type || ""}`.trim();
}

function renderList(container, items, renderer, emptyText = "Không có dữ liệu.") {
  container.innerHTML = items.length ? items.map(renderer).join("") : `<p class="empty">${emptyText}</p>`;
}

function stat(label, value) {
  return `<div class="stat"><strong>${escapeHtml(String(value))}</strong><span>${label}</span></div>`;
}

function numberFromInput(input) {
  const value = input?.value;
  if (value === "" || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function matchText(match) {
  return norm(`${match.number} ${match.team1} ${match.team2} ${match.venue} ${match.stage}`);
}

function norm(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value) {
  if (!value) return "Chưa rõ giờ";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
