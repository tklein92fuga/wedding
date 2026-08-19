const SHEET_NAME = 'RSVP';
const HEADERS = [
  'ID', 'Prénom', 'Nom', 'Contact', 'Adresse', 'Code postal', 'Ville', 'Pays',
  'Catégorie', 'Personnes', 'Accompagnants', 'Brunch', 'Personnes brunch',
  'Montant brunch (€)', 'Notes', 'Date', 'Mis à jour le'
];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action !== 'list') throw new Error('Action inconnue');
    return json_({ ok: true, rsvps: listRsvps_() });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'upsert') upsert_(body.entry);
    else if (body.action === 'delete') remove_(body.id);
    else throw new Error('Action inconnue');
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), HEADERS.length)).getDisplayValues()[0];
    if (currentHeaders[4] === 'Catégorie') sheet.insertColumnsAfter(4, 4);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function upsert_(entry) {
  if (!entry || !String(entry.prenom || '').trim() || !String(entry.nom || '').trim() || !String(entry.contact || '').trim()) {
    throw new Error('Champs obligatoires manquants');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_();
    const id = String(entry.id || Date.now());
    const row = [
      id, clean_(entry.prenom), clean_(entry.nom), clean_(entry.contact), clean_(entry.adresse),
      clean_(entry.codePostal), clean_(entry.ville), clean_(entry.pays), clean_(entry.cat),
      Number(entry.total || 1), JSON.stringify(entry.guests || []), entry.brunch ? 'Oui' : 'Non',
      Number(entry.brunchCount || 0), Number(entry.brunchCount || 0) * 30,
      clean_(entry.notes), clean_(entry.date), new Date()
    ];
    const lastRow = sheet.getLastRow();
    let target = lastRow + 1;
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
      const existing = ids.indexOf(id);
      if (existing >= 0) target = existing + 2;
    }
    sheet.getRange(target, 1, 1, row.length).setValues([row]);
  } finally {
    lock.releaseLock();
  }
}

function remove_(id) {
  const sheet = sheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
  const index = ids.indexOf(String(id));
  if (index >= 0) sheet.deleteRow(index + 2);
}

function listRsvps_() {
  const sheet = sheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues().map(row => {
    let guests = [];
    try { guests = JSON.parse(row[10] || '[]'); } catch (e) {}
    return {
      id: row[0], prenom: row[1], nom: row[2], contact: row[3], adresse: row[4] || '',
      codePostal: row[5] || '', ville: row[6] || '', pays: row[7] || '', cat: row[8],
      total: Number(row[9] || 1), guests: guests, brunch: row[11] === 'Oui',
      brunchCount: Number(row[12] || 0), notes: row[14] || '', date: row[15] || ''
    };
  });
}

function clean_(value) {
  const text = String(value == null ? '' : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
