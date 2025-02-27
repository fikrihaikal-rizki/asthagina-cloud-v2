import { Auth, google } from "googleapis";
const auth = new Auth.GoogleAuth({
  keyFile: "googleappis.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const client = await auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: client });

// const spreadsheetId = process.env.SHEET_MAIN_ID;

const loopLimit = process.env.SHEET_LOOP_LIMIT;
var sheetId = "";
var index = 0;
var firstRow = 0;
var firstIndex = 0;
var lastIndex = 0;

function setRange(
  sheetName,
  firstColumn,
  lastColumn,
  startRow = null,
  endRow = null
) {
  return sheetName + "!" + firstColumn + startRow + ":" + lastColumn + endRow;
}

export function setInitSheet(spreadsheetId, noRow = 0) {
  sheetId = spreadsheetId;
  firstRow = noRow;
  firstIndex = firstRow;
  lastIndex = firstRow;
  index = 0;
}

export function sheetLoop(row = 50) {
  lastIndex = row * index + row + firstRow;
  firstIndex = lastIndex - row;
  if (firstIndex != firstRow) {
    firstIndex = firstIndex + 1;
  }

  index++;

  return { firstIndex, lastIndex };
}

export function isLimitLoop() {
  if (index == loopLimit) {
    return true;
  }

  return false;
}

export async function getSheetValue(
  sheetName,
  firstColumn,
  lastColumn,
  startRow = null,
  endRow = null
) {
  var result = [];
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    sheetId,
    range: setRange(sheetName, firstColumn, lastColumn, startRow, endRow),
  });
  console.log(getRows);
  return result;
}
