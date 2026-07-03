const LOCAL_KEY = "wc2026-local-config-v2";
const ADMIN_EDIT_CODE = "2026";
const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbxCn1e_mwjgB6XUBtMcFlTqP2KxERsX8XWsd4mCsTy10YfUxZ2ScGt_6eai1D5A5fe5/exec";
const MATCH_DATA_VERSION = "2026-07-03-r16-v2";

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

const memberNameAliases = {
  "Nguyễn Đức Đồng": "Nguyễn Đức Đông",
};

const defaultSettings = {
  groupExactPoints: 1,
  roundOf32ExactPoints: 2,
  quarterFinalExactPoints: 3,
  semiFinalExactPoints: 4,
  finalExactPoints: 5,
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
  { key: "champion", label: "Nhà Vô địch World Cup 2026", valueLabel: "Tổng Giá trị 1.000 VNĐ", amount: 1000000 },
  {
    key: "goldenBall",
    label: "Quả bóng Vàng (Golden Ball): Cầu thủ xuất sắc nhất giải đấu",
    valueLabel: "Tổng Giá trị 1.000 VNĐ",
    amount: 1000000,
  },
  {
    key: "goldenBoot",
    label: "Chiếc giày Vàng (Golden Boot): Vua phá lưới",
    valueLabel: "Tổng Giá trị 1.000 VNĐ",
    amount: 1000000,
  },
  {
    key: "goldenGlove",
    label: "Găng tay Vàng (Golden Glove): Thủ môn xuất sắc nhất",
    valueLabel: "Tổng Giá trị 1.000 VNĐ",
    amount: 1000000,
  },
  {
    key: "fairPlay",
    label: "Giải phong cách (FIFA Fair Play Trophy): Đội bóng có lối chơi và hành vi đẹp nhất giải",
    valueLabel: "Tổng Giá trị 1.000 VNĐ",
    amount: 1000000,
  },
];

const teamFlagCodes = {
  algeria: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgium: "be",
  "bosnia and herzegovina": "ba",
  brazil: "br",
  "cabo verde": "cv",
  canada: "ca",
  "cape verde": "cv",
  colombia: "co",
  "congo dr": "cd",
  croatia: "hr",
  curacao: "cw",
  "cote d'ivoire": "ci",
  czechia: "cz",
  "czech republic": "cz",
  "dr congo": "cd",
  ecuador: "ec",
  egypt: "eg",
  england: "gb-eng",
  france: "fr",
  germany: "de",
  ghana: "gh",
  haiti: "ht",
  iran: "ir",
  "ir iran": "ir",
  iraq: "iq",
  "ivory coast": "ci",
  japan: "jp",
  jordan: "jo",
  "korea republic": "kr",
  mexico: "mx",
  morocco: "ma",
  netherlands: "nl",
  "new zealand": "nz",
  norway: "no",
  panama: "pa",
  paraguay: "py",
  portugal: "pt",
  qatar: "qa",
  "saudi arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  "south africa": "za",
  "south korea": "kr",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  tunisia: "tn",
  turkiye: "tr",
  turkey: "tr",
  "united states": "us",
  uruguay: "uy",
  uzbekistan: "uz",
};

let matches = [];
let state = {
  members: defaultMembers,
  currentMember: defaultMembers[0],
  predictions: {},
  awardPredictions: {},
  results: {},
  settings: { ...defaultSettings },
  lastReminderDate: "",
};
let localConfig = loadLocalConfig();
let toastTimer = null;

const els = {
  seasonMeta: document.querySelector("#seasonMeta"),
  memberSelect: document.querySelector("#memberSelect"),
  apiStatus: document.querySelector("#apiStatus"),
  notifyBtn: document.querySelector("#notifyBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  stats: document.querySelector("#stats"),
  dailyStatusTitle: document.querySelector("#dailyStatusTitle"),
  todayPredictionStatus: document.querySelector("#todayPredictionStatus"),
  scheduleSearch: document.querySelector("#scheduleSearch"),
  scheduleList: document.querySelector("#scheduleList"),
  predictSearch: document.querySelector("#predictSearch"),
  predictFilter: document.querySelector("#predictFilter"),
  predictionList: document.querySelector("#predictionList"),
  groupOverviewSearch: document.querySelector("#groupOverviewSearch"),
  groupOverviewFilter: document.querySelector("#groupOverviewFilter"),
  predictionOverview: document.querySelector("#predictionOverview"),
  awardPredictionForm: document.querySelector("#awardPredictionForm"),
  awardPredictionMatrix: document.querySelector("#awardPredictionMatrix"),
  refreshAwardsBtn: document.querySelector("#refreshAwardsBtn"),
  resultSearch: document.querySelector("#resultSearch"),
  resultList: document.querySelector("#resultList"),
  syncResultsBtn: document.querySelector("#syncResultsBtn"),
  leaderboardRows: document.querySelector("#leaderboardRows"),
  exportBtn: document.querySelector("#exportBtn"),
  exportSettingsBtn: document.querySelector("#exportSettingsBtn"),
  membersInput: document.querySelector("#membersInput"),
  saveMembersBtn: document.querySelector("#saveMembersBtn"),
  groupExactPoints: document.querySelector("#groupExactPoints"),
  roundOf32ExactPoints: document.querySelector("#roundOf32ExactPoints"),
  quarterFinalExactPoints: document.querySelector("#quarterFinalExactPoints"),
  semiFinalExactPoints: document.querySelector("#semiFinalExactPoints"),
  finalExactPoints: document.querySelector("#finalExactPoints"),
  matchFee: document.querySelector("#matchFee"),
  resultsUrl: document.querySelector("#resultsUrl"),
  reminderTime: document.querySelector("#reminderTime"),
  apiUrl: document.querySelector("#apiUrl"),
  adminEditCode: document.querySelector("#adminEditCode"),
  saveSettingsBtn: document.querySelector("#saveSettingsBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  costRows: document.querySelector("#costRows"),
  prizeRows: document.querySelector("#prizeRows"),
  prizeTotal: document.querySelector("#prizeTotal"),
  toast: document.querySelector("#toast"),
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
    const response = await fetch(`data/matches.json?v=${MATCH_DATA_VERSION}`, { cache: "no-store" });
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
  const fallback = { apiUrl: DEFAULT_API_URL, currentMember: defaultMembers[0], lastReminderDate: "", adminCode: "" };
  if (!saved) return fallback;
  const config = { ...fallback, ...JSON.parse(saved) };
  config.apiUrl = config.apiUrl || DEFAULT_API_URL;
  return config;
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
    state.members = normalizeMembers(remote.members?.length ? remote.members : defaultMembers);
    state.predictions = normalizePredictions(remote.predictions || {});
    state.awardPredictions = normalizeAwardPredictions(remote.awardPredictions || {});
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
  els.scheduleSearch.addEventListener("input", renderSchedule);
  els.predictSearch.addEventListener("input", renderPredictions);
  els.predictFilter.addEventListener("change", renderPredictions);
  els.groupOverviewSearch.addEventListener("input", renderPredictionOverview);
  els.groupOverviewFilter.addEventListener("change", renderPredictionOverview);
  els.refreshAwardsBtn.addEventListener("click", refreshSharedState);
  els.resultSearch.addEventListener("input", renderResults);
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
  renderSchedule();
  renderPredictions();
  renderPredictionOverview();
  renderAwardPredictions();
  renderResults();
  renderLeaderboard();
  renderSettings();
  renderFinance();
}

function renderPredictionSaveUpdate() {
  renderDashboard();
  renderPredictions();
  renderPredictionOverview();
  renderLeaderboard();
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

function normalizeMembers(members) {
  return members.map((member) => memberNameAliases[member] || member);
}

function normalizePredictions(predictions) {
  const normalized = {};
  Object.entries(predictions).forEach(([matchId, byMember]) => {
    normalized[matchId] = {};
    Object.entries(byMember || {}).forEach(([member, prediction]) => {
      normalized[matchId][memberNameAliases[member] || member] = prediction;
    });
  });
  return normalized;
}

function normalizeAwardPredictions(awardPredictions) {
  const normalized = {};
  Object.entries(awardPredictions).forEach(([awardKey, byMember]) => {
    normalized[awardKey] = {};
    Object.entries(byMember || {}).forEach(([member, prediction]) => {
      normalized[awardKey][memberNameAliases[member] || member] = prediction;
    });
  });
  return normalized;
}

function renderDashboard() {
  const dayMatches = dailyStatusMatches();
  const totalSlots = dayMatches.length * state.members.length;
  const predictedSlots = dayMatches.reduce(
    (sum, match) => sum + state.members.filter((member) => getPrediction(member, match.id)).length,
    0
  );
  const missingSlots = Math.max(totalSlots - predictedSlots, 0);
  const completionRate = totalSlots ? Math.round((predictedSlots / totalSlots) * 100) : 0;
  els.stats.innerHTML = [
    stat("Số trận trong ngày", dayMatches.length),
    stat("Lượt đã dự đoán", predictedSlots),
    stat("Lượt chưa dự đoán", missingSlots),
    stat("Hoàn thành", `${completionRate}%`),
  ].join("");
  renderDailyPredictionStatus();
}

function renderSchedule() {
  const query = norm(els.scheduleSearch.value);
  const filtered = matches.filter((match) => matchText(match).includes(query));
  const grouped = groupMatchesByDate(filtered);
  const days = Object.keys(grouped).sort();

  els.scheduleList.innerHTML = days.length
    ? days
        .map(
          (day) => `<section class="day-group">
            <h3>${formatDateOnly(day)} <span>${grouped[day].length} trận</span></h3>
            <div class="table-wrap">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Giờ VN</th>
                    <th>Đội 1</th>
                    <th>Đội 2</th>
                    <th>Sân</th>
                    <th>Dự đoán</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  ${grouped[day].map(scheduleRow).join("")}
                </tbody>
              </table>
            </div>
          </section>`
        )
        .join("")
    : `<p class="empty">Không có trận phù hợp.</p>`;
}

function scheduleRow(match) {
  const predictedCount = state.members.length - missingCount(match);
  const result = state.results[match.id];
  return `<tr>
    <td>${match.number}</td>
    <td>${formatTime(match.kickoffVietnam)}</td>
    <td><strong>${teamName(match.team1)}</strong></td>
    <td><strong>${teamName(match.team2)}</strong></td>
    <td>${escapeHtml(match.venue)}</td>
    <td>${predictedCount}/${state.members.length}</td>
    <td>${result ? `${result.score1} - ${result.score2}` : "Chưa có"}</td>
  </tr>`;
}

function renderDailyPredictionStatus() {
  const dayMatches = dailyStatusMatches();
  if (!dayMatches.length) {
    els.dailyStatusTitle.textContent = "Theo dõi dự đoán trong ngày";
    els.todayPredictionStatus.innerHTML = `<p class="empty">Không có trận trong hôm nay.</p>`;
    return;
  }

  const dayKey = dateKey(dayMatches[0].kickoffVietnam);
  els.dailyStatusTitle.textContent = `Theo dõi dự đoán ngày ${formatDateOnly(dayKey)}`;
  els.todayPredictionStatus.innerHTML = dayMatches.map(predictionStatusCard).join("");
}

function predictionStatusCard(match) {
  const predictedMembers = state.members.filter((member) => getPrediction(member, match.id));
  const missingMembers = state.members.filter((member) => !getPrediction(member, match.id));
  const result = state.results[match.id];
  const resultText = result ? `<span class="pill good">Kết quả ${result.score1} - ${result.score2}</span>` : "";
  return `<article class="status-card">
    <div class="status-head">
      <div>
        <strong>#${match.number} ${teamName(match.team1)} - ${teamName(match.team2)}</strong>
        <span>${formatDate(match.kickoffVietnam)} · ${escapeHtml(match.venue)}</span>
      </div>
      <div class="status-pills">
        ${resultText}
        <span class="pill ${missingMembers.length ? "warn" : "good"}">${predictedMembers.length}/${state.members.length} đã dự đoán</span>
      </div>
    </div>
    <div class="status-grid">
      <div>
        <h4>Đã dự đoán</h4>
        <div class="member-tags">${predictedMemberTags(predictedMembers, match)}</div>
      </div>
      <div>
        <h4>Chưa dự đoán</h4>
        <div class="member-tags">${memberTags(missingMembers, "warn")}</div>
      </div>
    </div>
  </article>`;
}

function predictedMemberTags(members, match) {
  const result = state.results[match.id];
  return members.length
    ? members
        .map((member) => {
          const prediction = getPrediction(member, match.id);
          const exact = result && prediction.score1 === result.score1 && prediction.score2 === result.score2;
          return `<span class="member-tag ${exact ? "exact" : "predicted"}">${escapeHtml(member)} <strong>${prediction.score1} - ${prediction.score2}</strong></span>`;
        })
        .join("")
    : `<span class="muted">Không có</span>`;
}

function memberTags(members, type) {
  return members.length
    ? members.map((member) => `<span class="member-tag ${type}">${escapeHtml(member)}</span>`).join("")
    : `<span class="muted">Không có</span>`;
}

function renderPredictions() {
  const member = state.currentMember;
  const list = filteredPredictionMatches(member);
  renderList(els.predictionList, list, (match) => matchCard(match, "predict"));
}

function filteredPredictionMatches(member) {
  const query = norm(els.predictSearch.value);
  const filter = els.predictFilter.value;
  let list = matches.filter((match) => matchText(match).includes(query));
  if (filter === "open") list = list.filter(isOpen);
  if (filter === "missing") list = list.filter((match) => !getPrediction(member, match.id));
  if (filter === "scored") list = list.filter((match) => state.results[match.id]);
  return list;
}

function renderPredictionOverview() {
  const list = filteredGroupOverviewMatches();
  els.predictionOverview.innerHTML = list.length
    ? `<table class="prediction-overview-table">
        <thead>
          <tr>
            <th colspan="7" class="group-head">Lịch thi đấu World Cup 2026</th>
            <th colspan="${state.members.length}" class="group-head">Dự đoán</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Bảng/Vòng</th>
            <th>Đội</th>
            <th>Tỷ số</th>
            <th>Đội</th>
            ${state.members.map((member) => `<th>${shortMemberName(member)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${list.map(predictionOverviewRow).join("")}</tbody>
      </table>`
    : `<p class="empty">Không có trận phù hợp.</p>`;
}

function filteredGroupOverviewMatches() {
  const query = norm(els.groupOverviewSearch.value);
  const filter = els.groupOverviewFilter.value;
  let list = matches.filter((match) => matchText(match).includes(query));
  if (filter === "open") list = list.filter(isOpen);
  if (filter === "scored") list = list.filter((match) => state.results[match.id]);
  if (filter === "today") {
    const dayMatches = dailyStatusMatches();
    const ids = new Set(dayMatches.map((match) => match.id));
    list = list.filter((match) => ids.has(match.id));
  }
  return list;
}

function predictionOverviewRow(match) {
  const result = state.results[match.id];
  return `<tr>
    <td>${match.number}</td>
    <td>${formatShortDate(match.kickoffVietnam)}</td>
    <td>${formatTime(match.kickoffVietnam)}</td>
    <td>${escapeHtml(match.stage)}</td>
    <td><strong>${teamName(match.team1)}</strong></td>
    <td class="score-cell">${result ? `${result.score1} - ${result.score2}` : ""}</td>
    <td><strong>${teamName(match.team2)}</strong></td>
    ${state.members.map((member) => predictionCell(member, match)).join("")}
  </tr>`;
}

function predictionCell(member, match) {
  const prediction = getPrediction(member, match.id);
  const result = state.results[match.id];
  if (!prediction) return `<td class="prediction-cell missing">-</td>`;
  const exact = result && prediction.score1 === result.score1 && prediction.score2 === result.score2;
  return `<td class="prediction-cell ${exact ? "exact" : ""}">${prediction.score1} - ${prediction.score2}</td>`;
}

function shortMemberName(member) {
  const parts = String(member).trim().split(/\s+/);
  if (parts.length <= 2) return member;
  return `${parts[0][0]}.${parts.slice(-1)[0]}`;
}

function renderAwardPredictions() {
  renderAwardPredictionForm();
  renderAwardPredictionMatrix();
}

function renderAwardPredictionForm() {
  els.awardPredictionForm.innerHTML = fixedPrizeRows
    .map((award) => {
      const prediction = getAwardPrediction(state.currentMember, award.key);
      return `<article class="award-row">
        <label>
          <strong>${escapeHtml(award.label)}</strong>
          <input type="text" value="${escapeHtml(prediction)}" data-award-input="${award.key}" placeholder="Nhập đội/cầu thủ dự đoán" />
        </label>
        <button type="button" data-save-award="${award.key}">Lưu</button>
      </article>`;
    })
    .join("");
}

function renderAwardPredictionMatrix() {
  const headerCells = state.members.map((member) => `<th>${escapeHtml(member)}</th>`).join("");
  const rows = fixedPrizeRows
    .map(
      (award) => `<tr>
        <td><strong>${escapeHtml(award.label)}</strong></td>
        ${state.members
          .map((member) => `<td>${escapeHtml(getAwardPrediction(member, award.key) || "Chưa dự đoán")}</td>`)
          .join("")}
      </tr>`
    )
    .join("");

  els.awardPredictionMatrix.innerHTML = `<table class="award-matrix">
    <thead>
      <tr>
        <th>Hạng mục</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
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
        <td><strong class="${index === 0 ? "leader-name top-leader" : "leader-name"}">${index === 0 ? '<span class="laurel" aria-label="Top 1">🏆</span>' : ""}${escapeHtml(row.name)}</strong></td>
        <td>${row.points}</td>
        <td>${row.missed}</td>
      </tr>`
    )
    .join("");
}

function renderFinance() {
  if (!els.costRows || !els.prizeRows || !els.prizeTotal) return;
  const fee = Number(state.settings.matchFee || defaultSettings.matchFee);
  const memberCount = state.members.length;
  const totalMatches = costRows.reduce((sum, row) => sum + row.matches, 0);
  const finance = financeSummary();
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
    `<tr><td>Tổng tối đa</td><td>${totalMatches}</td><td>${memberCount}</td><td></td><td>${formatMoney(finance.maxEntryPool)}</td></tr>`,
    `<tr class="total-row"><td>Tổng tạm thu hiện tại</td><td></td><td></td><td></td><td>${formatMoney(finance.entryPool)}</td></tr>`,
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

function renderSettings() {
  els.membersInput.value = state.members.join("\n");
  els.apiUrl.value = localConfig.apiUrl || "";
  if (els.adminEditCode) els.adminEditCode.value = localConfig.adminCode || "";
  Object.keys(defaultSettings).forEach((key) => {
    if (!els[key]) return;
    els[key].value = key === "matchFee" ? Number(state.settings[key] || 0) / 1000 : state.settings[key] ?? "";
  });
}

function matchCard(match, mode) {
  const prediction = getPrediction(state.currentMember, match.id);
  const result = state.results[match.id];
  const status = result ? "Đã có kết quả" : isOpen(match) ? "Còn mở" : "Đã qua giờ";
  const statusClass = result ? "good" : isOpen(match) ? "" : "warn";
  let body = "";

  if (mode === "predict") {
    const locked = Boolean(prediction);
    const disabled = (locked && !isAdminMode()) || (!isOpen(match) && !prediction) ? "disabled" : "";
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
      <span>${teamName(match.team1)}</span>
      <strong>${result ? `${result.score1} - ${result.score2}` : "vs"}</strong>
      <span>${teamName(match.team2)}</span>
    </div>
    <div class="card-body">${body}</div>
  </article>`;
}

document.addEventListener("click", (event) => {
  const predId = event.target.dataset.savePred;
  if (predId) savePrediction(predId);
  const awardKey = event.target.dataset.saveAward;
  if (awardKey) saveAwardPrediction(awardKey);
  const resultId = event.target.dataset.saveResult;
  if (resultId) saveResult(resultId);
  const clearId = event.target.dataset.clearResult;
  if (clearId) clearResult(clearId);
});

async function savePrediction(matchId) {
  if (!requireApi()) return;
  if (getPrediction(state.currentMember, matchId) && !isAdminMode()) {
    alert("Trận này đã có dự đoán, không thể sửa.");
    await refreshSharedState();
    return;
  }
  const inputs = [...document.querySelectorAll(`[data-pred="${matchId}"]`)];
  const score1 = numberFromInput(inputs.find((input) => input.dataset.side === "score1"));
  const score2 = numberFromInput(inputs.find((input) => input.dataset.side === "score2"));
  if (score1 === null || score2 === null) return alert("Nhập đủ tỉ số dự đoán.");
  try {
    await apiCall("savePrediction", { matchId, member: state.currentMember, score1, score2, adminCode: localConfig.adminCode || "" });
    state.predictions[matchId] ||= {};
    state.predictions[matchId][state.currentMember] = {
      score1,
      score2,
      savedAt: new Date().toISOString(),
    };
    renderPredictionSaveUpdate();
    showToast("Đã lưu dự đoán thành công.");
  } catch (error) {
    alert(error.message === "Prediction is locked" ? "Trận này đã có dự đoán, không thể sửa." : "Không lưu được dự đoán.");
    await refreshSharedState();
  }
}

async function saveAwardPrediction(awardKey) {
  if (!requireApi()) return;
  const award = fixedPrizeRows.find((item) => item.key === awardKey);
  const input = document.querySelector(`[data-award-input="${awardKey}"]`);
  const prediction = input?.value.trim();
  if (!award || !prediction) return alert("Nhập nội dung dự đoán trước khi lưu.");
  await apiCall("saveAwardPrediction", {
    awardKey,
    awardLabel: award.label,
    member: state.currentMember,
    prediction,
  });
  await refreshSharedState();
  showToast("Đã lưu dự đoán giải.");
}

async function saveResult(matchId) {
  if (!requireApi()) return;
  const inputs = [...document.querySelectorAll(`[data-result="${matchId}"]`)];
  const score1 = numberFromInput(inputs.find((input) => input.dataset.side === "score1"));
  const score2 = numberFromInput(inputs.find((input) => input.dataset.side === "score2"));
  if (score1 === null || score2 === null) return alert("Nhập đủ tỉ số kết quả.");
  await apiCall("saveResult", { matchId, score1, score2 });
  await refreshSharedState();
  showToast("Đã lưu kết quả.");
}

async function clearResult(matchId) {
  if (!requireApi()) return;
  await apiCall("clearResult", { matchId });
  await refreshSharedState();
  showToast("Đã xóa kết quả.", "warn");
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
      points: 0,
      counted: true,
    };
  }
  if (prediction.score1 === result.score1 && prediction.score2 === result.score2) {
    return { status: "exact", points: exactPointsForMatch(match), counted: true };
  }
  return {
    status: "wrong",
    points: 0,
    counted: true,
  };
}

function exactPointsForMatch(match) {
  const stage = String(match.stage || "").toLowerCase();
  if (stage.includes("final") && !stage.includes("semi") && !stage.includes("quarter")) {
    return Number(state.settings.finalExactPoints || defaultSettings.finalExactPoints);
  }
  if (stage.includes("semi")) {
    return Number(state.settings.semiFinalExactPoints || defaultSettings.semiFinalExactPoints);
  }
  if (stage.includes("third place")) {
    return Number(state.settings.semiFinalExactPoints || defaultSettings.semiFinalExactPoints);
  }
  if (stage.includes("quarter")) {
    return Number(state.settings.quarterFinalExactPoints || defaultSettings.quarterFinalExactPoints);
  }
  if (stage.includes("round of 32") || stage.includes("round of 16")) {
    return Number(state.settings.roundOf32ExactPoints || defaultSettings.roundOf32ExactPoints);
  }
  return Number(state.settings.groupExactPoints || defaultSettings.groupExactPoints);
}

function memberFee(member) {
  const fee = Number(state.settings.matchFee || defaultSettings.matchFee);
  return matches.reduce((sum, match) => sum + memberMatchFee(member, match, fee), 0);
}

function memberMatchFee(member, match, fee = Number(state.settings.matchFee || defaultSettings.matchFee)) {
  const prediction = getPrediction(member, match.id);
  const result = state.results[match.id];
  if (!prediction) return result ? fee : 0;
  if (result && prediction.score1 === result.score1 && prediction.score2 === result.score2) return 0;
  return fee;
}

function financeSummary() {
  const fee = Number(state.settings.matchFee || defaultSettings.matchFee);
  const totalMatches = costRows.reduce((sum, row) => sum + row.matches, 0);
  const entryPool = state.members.reduce((sum, member) => sum + memberFee(member), 0);
  const maxEntryPool = totalMatches * fee * state.members.length;
  const fixedPrize = fixedPrizeRows.reduce((sum, row) => sum + row.amount, 0);
  return {
    entryPool,
    maxEntryPool,
    fixedPrize,
    totalPrize: fixedPrize,
  };
}

function getPrediction(member, matchId) {
  return state.predictions[matchId]?.[member];
}

function getAwardPrediction(member, awardKey) {
  return state.awardPredictions[awardKey]?.[member]?.prediction || "";
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

function nextTwoDayMatches() {
  const now = new Date();
  const end = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  return matches
    .filter((match) => {
      const kickoff = new Date(match.kickoffVietnam);
      return kickoff >= now && kickoff <= end;
    })
    .sort((a, b) => new Date(a.kickoffVietnam) - new Date(b.kickoffVietnam));
}

function dailyStatusMatches() {
  return todayMatches().slice(0, 3);
}

function todayMatches() {
  return matchesForDate(localDateKey());
}

function matchesForDate(dayKey) {
  return matches
    .filter((match) => dateKey(match.kickoffVietnam) === dayKey)
    .sort((a, b) => new Date(a.kickoffVietnam) - new Date(b.kickoffVietnam));
}

function groupMatchesByDate(list) {
  return list.reduce((groups, match) => {
    const key = dateKey(match.kickoffVietnam) || "unknown";
    groups[key] ||= [];
    groups[key].push(match);
    groups[key].sort((a, b) => new Date(a.kickoffVietnam) - new Date(b.kickoffVietnam));
    return groups;
  }, {});
}

function dateKey(value) {
  return value ? String(value).slice(0, 10) : "";
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    const result = await apiCall("syncResultsFromUrl");
    await refreshSharedState();
    alert(`Đã cập nhật ${result.updated || 0} kết quả và tính lại điểm.`);
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
  localConfig.adminCode = els.adminEditCode?.value.trim() || "";
  saveLocalConfig();

  if (!nextApiUrl) {
    setApiStatus("Chưa kết nối Google Sheets", "warn");
    alert("Đã lưu cấu hình cục bộ. Hãy dán URL Web App Apps Script để đồng bộ Google Sheets.");
    renderAll();
    return;
  }

  const settings = {};
  Object.keys(defaultSettings).forEach((key) => {
    if (key === "matchFee") {
      settings[key] = Number(els[key]?.value || 0) * 1000;
      return;
    }
    settings[key] = els[key]?.type === "number" ? Number(els[key].value || 0) : els[key]?.value ?? defaultSettings[key];
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

function isAdminMode() {
  return localConfig.adminCode === ADMIN_EDIT_CODE;
}

function setApiStatus(text, type) {
  els.apiStatus.textContent = text;
  els.apiStatus.className = `pill ${type || ""}`.trim();
}

function showToast(message, type = "good") {
  if (!els.toast) return;
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.className = `toast ${type} show`;
  toastTimer = window.setTimeout(() => {
    els.toast.className = "toast";
  }, 2200);
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

function teamName(team) {
  const flag = teamFlag(team);
  return `<span class="team-name">${flag}<span>${escapeHtml(team)}</span></span>`;
}

function teamFlag(team) {
  const code = teamFlagCodes[norm(team)];
  if (!code) return "";
  return `<img class="team-flag" src="https://flagcdn.com/w20/${code}.png" srcset="https://flagcdn.com/w40/${code}.png 2x" alt="" loading="lazy" />`;
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

function formatDateOnly(value) {
  if (!value || value === "unknown") return "Chưa rõ ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
  }).format(new Date(`${value}T00:00:00`));
}

function formatShortDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format((value || 0) / 1000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
