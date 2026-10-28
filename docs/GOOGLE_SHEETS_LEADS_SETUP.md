# Google Sheets Leads Setup

All leads (contact, enterprise, battery finder, UPS proposal, solar, etc.) are sent to a **single Google Sheet**. Most sources go to the **Leads** tab. Power Backup Calculator submissions go to a **separate tab** in the same spreadsheet so you can monitor those leads cleanly.

## 1. Create / reuse the Google Sheet

1. Use your existing leads Google Sheet (or create one).
2. Keep (or create) a tab named **Leads**.
3. The Apps Script will create a **Power Backup Calculator** tab automatically on first backup-calculator lead (or create it yourself).

## 2. Create / update the Apps Script Web App

1. In the Google Sheet, go to **Extensions → Apps Script**.
2. Replace the script with the code below.
3. Set `SECURITY_KEY` to a random string (e.g. from `openssl rand -hex 16`).
4. Save the project.
5. Deploy: **Deploy → New deployment** → Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL**.
6. If you already had a deployment, create a **new version** so the updated script is live.

## 3. Apps Script Code

```javascript
const SECURITY_KEY = 'YOUR_RANDOM_SECURITY_KEY'; // Change this!
const LEADS_SHEET_NAME = 'Leads';
const BACKUP_CALC_SHEET_NAME = 'Power Backup Calculator';

const LEADS_HEADERS = [
  'Timestamp', 'Source', 'Name', 'Phone', 'Email', 'Query Type', 'Message',
  'Company', 'Contact Person', 'Quantity', 'Timeline', 'Comments',
  'Vehicle Brand', 'Vehicle Model', 'Vehicle Variant', 'Load (W)', 'Backup Hours', 'UPS Type',
  'Roof Type', 'Roof Area', 'Monthly Bill', 'Extra'
];

const BACKUP_CALC_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Use Case', 'Backup Hours',
  'Connected Load (W)', 'Running Load (W)', 'Peak / Surge (W)', 'System Type',
  'Inverter VA', 'Battery Ah', 'Battery Count', 'Bank Voltage', 'Estimated Hours',
  'Needs Survey', 'Appliances', 'Notes', 'Extra'
];

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    return;
  }
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== headers[0]) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.key !== SECURITY_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = data.action || 'append_lead';
    const row = data.row;
    if (!row || !Array.isArray(row)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Missing row' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'append_backup_calculator') {
      const sheetName = data.sheetName || BACKUP_CALC_SHEET_NAME;
      const sheet = getOrCreateSheet(sheetName, BACKUP_CALC_HEADERS);
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, sheet: sheetName }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'append_lead') {
      const sheet = getOrCreateSheet(LEADS_SHEET_NAME, LEADS_HEADERS);
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err.message) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 4. Configure Your App

Add to `.env.local` (placeholders are already in `.env.example`):

```
GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
GOOGLE_SHEETS_SECURITY_KEY="YOUR_RANDOM_SECURITY_KEY"
GOOGLE_SHEETS_BACKUP_CALC_TAB="Power Backup Calculator"
```

Use the same `SECURITY_KEY` as in the Apps Script. `GOOGLE_SHEETS_BACKUP_CALC_TAB` is optional; it defaults to `Power Backup Calculator`.

## 5. Behavior

- If `GOOGLE_SHEETS_WEB_APP_URL` is empty, leads are still saved to Supabase but not sent to Google Sheets.
- Sending to Google Sheets is fire-and-forget; API errors are logged but do not affect the user response.
- Backup calculator rows include name, phone, use case, loads, recommended inverter/battery, appliances list, and notes.
- Other lead types keep using the **Leads** tab with a `Source` column.
