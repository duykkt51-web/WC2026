const DEFAULT_MEMBERS = [
  'Nguyễn Đức Đông',
  'Phan Phước Gia',
  'Bùi Hoàng Duy',
  'Lê Minh Vũ',
  'Vũ Hồng Cường',
  'Nguyễn Đức Toàn',
  'Bùi Trung Kiên',
  'Phạm Quốc Huy',
  'Đỗ Thị Lành',
  'Phạm Hồng Cường',
  'Lại Cao Khiêm',
  'Nguyễn Văn Chiến',
  'Trần Thanh Hải',
  'Phùng Hoài Anh',
  'Nguyễn Đình Chức',
];

const MEMBER_NAME_ALIASES = {
  'Nguyễn Đức Đồng': 'Nguyễn Đức Đông',
};

const ADMIN_EDIT_CODE = '2026';

const DEFAULT_SETTINGS = {
  groupExactPoints: 1,
  roundOf32ExactPoints: 2,
  quarterFinalExactPoints: 3,
  semiFinalExactPoints: 4,
  finalExactPoints: 5,
  matchFee: 30000,
  resultsUrl: '',
  reminderTime: '09:00',
};

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : { action: 'getState', callback: 'callback' };
  const callback = params.callback || 'callback';
  let payload;

  try {
    payload = { ok: true, data: route_(params) };
  } catch (error) {
    payload = { ok: false, error: String(error && error.message ? error.message : error) };
  }

  const output = `${callback}(${JSON.stringify(payload)})`;
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function setup() {
  ensureSheets_();
  return getState_();
}

function route_(params) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureSheets_();
    switch (params.action || 'getState') {
      case 'getState':
        return getState_();
      case 'savePrediction':
        savePrediction_(params);
        return getState_();
      case 'saveAwardPrediction':
        saveAwardPrediction_(params);
        return getState_();
      case 'saveResult':
        saveResult_(params);
        return getState_();
      case 'clearResult':
        clearResult_(params.matchId);
        return getState_();
      case 'saveMembers':
        saveMembers_(JSON.parse(params.members || '[]'));
        return getState_();
      case 'saveSettings':
        saveSettings_(JSON.parse(params.settings || '{}'));
        return getState_();
      case 'resetVotes':
        resetVotes_();
        return getState_();
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  } finally {
    lock.releaseLock();
  }
}

function ensureSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, 'Members', ['name']);
  ensureSheet_(ss, 'Predictions', ['matchId', 'member', 'score1', 'score2', 'savedAt']);
  ensureSheet_(ss, 'AwardPredictions', ['awardKey', 'awardLabel', 'member', 'prediction', 'savedAt']);
  ensureSheet_(ss, 'Results', ['matchId', 'score1', 'score2', 'updatedAt']);
  ensureSheet_(ss, 'Settings', ['key', 'value']);

  const membersSheet = ss.getSheetByName('Members');
  if (membersSheet.getLastRow() < 2) {
    membersSheet.getRange(2, 1, DEFAULT_MEMBERS.length, 1).setValues(DEFAULT_MEMBERS.map((name) => [name]));
  }

  const settingsSheet = ss.getSheetByName('Settings');
  if (settingsSheet.getLastRow() < 2) saveSettings_(DEFAULT_SETTINGS);
  migrateMemberNames_();
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (current.join('|') !== headers.join('|')) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function getState_() {
  return {
    members: readMembers_(),
    predictions: readPredictions_(),
    awardPredictions: readAwardPredictions_(),
    results: readResults_(),
    settings: readSettings_(),
  };
}

function readMembers_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Members');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return DEFAULT_MEMBERS;
  return sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat()
    .map((name) => String(name).trim())
    .map((name) => MEMBER_NAME_ALIASES[name] || name)
    .filter(Boolean);
}

function readPredictions_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Predictions');
  const lastRow = sheet.getLastRow();
  const data = {};
  if (lastRow < 2) return data;
  sheet.getRange(2, 1, lastRow - 1, 5).getValues().forEach((row) => {
    const [matchId, member, score1, score2, savedAt] = row;
    if (!matchId || !member) return;
    if (!data[matchId]) data[matchId] = {};
    data[matchId][MEMBER_NAME_ALIASES[member] || member] = {
      score1: Number(score1),
      score2: Number(score2),
      savedAt: savedAt || '',
    };
  });
  return data;
}

function readAwardPredictions_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AwardPredictions');
  const lastRow = sheet.getLastRow();
  const data = {};
  if (lastRow < 2) return data;
  sheet.getRange(2, 1, lastRow - 1, 5).getValues().forEach((row) => {
    const [awardKey, awardLabel, member, prediction, savedAt] = row;
    if (!awardKey || !member) return;
    if (!data[awardKey]) data[awardKey] = {};
    data[awardKey][MEMBER_NAME_ALIASES[member] || member] = {
      awardLabel: awardLabel || '',
      prediction: prediction || '',
      savedAt: savedAt || '',
    };
  });
  return data;
}

function readResults_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Results');
  const lastRow = sheet.getLastRow();
  const data = {};
  if (lastRow < 2) return data;
  sheet.getRange(2, 1, lastRow - 1, 4).getValues().forEach((row) => {
    const [matchId, score1, score2, updatedAt] = row;
    if (!matchId) return;
    data[matchId] = {
      score1: Number(score1),
      score2: Number(score2),
      updatedAt: updatedAt || '',
    };
  });
  return data;
}

function readSettings_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  const lastRow = sheet.getLastRow();
  const settings = Object.assign({}, DEFAULT_SETTINGS);
  if (lastRow < 2) return settings;
  sheet.getRange(2, 1, lastRow - 1, 2).getValues().forEach((row) => {
    const key = row[0];
    if (!key) return;
    const value = row[1];
    settings[key] = isNaN(Number(value)) || value === '' ? value : Number(value);
  });
  return settings;
}

function savePrediction_(params) {
  const matchId = String(params.matchId || '').trim();
  const member = String(params.member || '').trim();
  const score1 = Number(params.score1);
  const score2 = Number(params.score2);
  if (!matchId || !member || !Number.isFinite(score1) || !Number.isFinite(score2)) {
    throw new Error('Invalid prediction');
  }
  const isAdmin = String(params.adminCode || '') === ADMIN_EDIT_CODE;
  const exists = rowExists_('Predictions', 5, (row) => row[0] === matchId && row[1] === member);
  if (exists && !isAdmin) {
    throw new Error('Prediction is locked');
  }
  const values = [
    matchId,
    member,
    score1,
    score2,
    new Date().toISOString(),
  ];
  if (exists) upsertRow_('Predictions', 5, (row) => row[0] === matchId && row[1] === member, values);
  else SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Predictions').appendRow(values);
}

function saveAwardPrediction_(params) {
  const awardKey = String(params.awardKey || '').trim();
  const awardLabel = String(params.awardLabel || '').trim();
  const member = String(params.member || '').trim();
  const prediction = String(params.prediction || '').trim();
  if (!awardKey || !member || !prediction) throw new Error('Invalid award prediction');
  upsertRow_('AwardPredictions', 5, (row) => row[0] === awardKey && row[2] === member, [
    awardKey,
    awardLabel,
    member,
    prediction,
    new Date().toISOString(),
  ]);
}

function saveResult_(params) {
  const matchId = String(params.matchId || '').trim();
  const score1 = Number(params.score1);
  const score2 = Number(params.score2);
  if (!matchId || !Number.isFinite(score1) || !Number.isFinite(score2)) throw new Error('Invalid result');
  upsertRow_('Results', 4, (row) => row[0] === matchId, [matchId, score1, score2, new Date().toISOString()]);
}

function clearResult_(matchId) {
  deleteRows_('Results', (row) => row[0] === matchId);
}

function saveMembers_(members) {
  const cleanMembers = members.map((name) => String(name).trim()).filter(Boolean);
  if (!cleanMembers.length) throw new Error('Members cannot be empty');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Members');
  sheet.clearContents();
  sheet.getRange(1, 1).setValue('name');
  sheet.getRange(2, 1, cleanMembers.length, 1).setValues(cleanMembers.map((name) => [name]));
}

function saveSettings_(settings) {
  const merged = Object.assign({}, DEFAULT_SETTINGS, settings || {});
  const rows = Object.keys(DEFAULT_SETTINGS).map((key) => [key, merged[key]]);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

function resetVotes_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const predictions = ss.getSheetByName('Predictions');
  predictions.clearContents();
  predictions.getRange(1, 1, 1, 5).setValues([['matchId', 'member', 'score1', 'score2', 'savedAt']]);
  const awardPredictions = ss.getSheetByName('AwardPredictions');
  awardPredictions.clearContents();
  awardPredictions.getRange(1, 1, 1, 5).setValues([['awardKey', 'awardLabel', 'member', 'prediction', 'savedAt']]);
  const results = ss.getSheetByName('Results');
  results.clearContents();
  results.getRange(1, 1, 1, 4).setValues([['matchId', 'score1', 'score2', 'updatedAt']]);
}

function migrateMemberNames_() {
  migrateColumnValues_('Members', 1);
  migrateColumnValues_('Predictions', 2);
  migrateColumnValues_('AwardPredictions', 3);
}

function migrateColumnValues_(sheetName, columnIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const range = sheet.getRange(2, columnIndex, lastRow - 1, 1);
  const values = range.getValues();
  let changed = false;
  const nextValues = values.map((row) => {
    const current = String(row[0] || '').trim();
    const next = MEMBER_NAME_ALIASES[current] || row[0];
    if (next !== row[0]) changed = true;
    return [next];
  });
  if (changed) range.setValues(nextValues);
}

function upsertRow_(sheetName, columnCount, predicate, values) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const data = sheet.getRange(2, 1, lastRow - 1, columnCount).getValues();
    for (let index = 0; index < data.length; index += 1) {
      if (predicate(data[index])) {
        sheet.getRange(index + 2, 1, 1, columnCount).setValues([values]);
        return;
      }
    }
  }
  sheet.appendRow(values);
}

function rowExists_(sheetName, columnCount, predicate) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const data = sheet.getRange(2, 1, lastRow - 1, columnCount).getValues();
  return data.some(predicate);
}

function deleteRows_(sheetName, predicate) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (let index = data.length - 1; index >= 0; index -= 1) {
    if (predicate(data[index])) sheet.deleteRow(index + 2);
  }
}
