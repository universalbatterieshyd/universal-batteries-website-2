# Google Sheets Leads Setup

All leads (contact, enterprise, battery finder, UPS proposal, solar, etc.) are sent to a **single Google Sheet** with one tab containing all attribution columns. The `Source` column identifies the lead type.

## 1. Create the Google Sheet

1. Create a new Google Sheet (or use an existing one).
2. Rename the first sheet to **Leads** (or keep as "Sheet1").
3. The Apps Script will add the header row automatically on first use. You can leave the sheet empty.

## 2. Create the Apps Script Web App

1. In the Google Sheet, go to **Extensions → Apps Script**.
2. Delete any default code and paste the script below.
3. Set `SECURITY_KEY` to a random string (e.g. from `openssl rand -hex 16`).
4. Save the project.
5. Deploy: **Deploy → New deployment** → Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL**.

## 3. Apps Script Code

```javascript
const SECURITY_KEY = 'YOUR_RANDOM_SECURITY_KEY'; // Change this!
const SHEET_NAME = 'Leads';

const HEADERS = [
  'Timestamp', 'Source', 'Name', 'Phone', 'Email', 'Query Type', 'Message',
  'Company', 'Contact Person', 'Quantity', 'Timeline', 'Comments',
  'Vehicle Brand', 'Vehicle Model', 'Vehicle Variant', 'Load (W)', 'Backup Hours', 'UPS Type',
  'Roof Type', 'Roof Area', 'Monthly Bill', 'Extra'
];

function ensureHeaders(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  }
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    return;
  }
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== 'Timestamp') {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
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
    if (action === 'append_lead') {
      const row = data.row;
      if (!row || !Array.isArray(row)) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Missing row' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) ||
        SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      ensureHeaders(sheet);
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

Add to `.env.local`:

```
GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
GOOGLE_SHEETS_SECURITY_KEY="YOUR_RANDOM_SECURITY_KEY"
```

Use the same `SECURITY_KEY` as in the Apps Script.

## 5. Optional: Multiple Tabs by Source

If you prefer separate tabs per lead type (e.g. Contact, Enterprise, Battery Finder), you can modify the Apps Script to route by `data.source` and append to the appropriate sheet. The current implementation uses a single tab with a `Source` column for simplicity and easier filtering.

## 6. Behavior

- If `GOOGLE_SHEETS_WEB_APP_URL` is empty, leads are still saved to Supabase but not sent to Google Sheets.
- Sending to Google Sheets is fire-and-forget; API errors are logged but do not affect the user response.
- All lead types share the same row format; empty columns are left blank for that source.
