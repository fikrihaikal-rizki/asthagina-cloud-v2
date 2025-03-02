import { Auth, google } from "googleapis";
const auth = new Auth.GoogleAuth({
  keyFile: "googleappis.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const client = await auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: client });

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
  if (startRow == null) {
    startRow = "";
  }

  if (endRow == null) {
    endRow = "";
  }

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
  console.log(setRange(sheetName, firstColumn, lastColumn, startRow, endRow));
  var result = [];
  const request = {
    auth: auth,
    spreadsheetId: sheetId,
    range: setRange(sheetName, firstColumn, lastColumn, startRow, endRow),
  };

  const getRows = await googleSheets.spreadsheets.values.get(request);
  console.log(getRows);
  return result;
}

export async function newReportSheet(sheetName) {
  const request = {
    auth: auth,
    spreadsheetId: sheetId,
    resource: {
      requests: {
        duplicateSheet: {
          sourceSheetId: 1776101743,
          newSheetName: sheetName,
        },
      },
    },
  };

  const copySheet = await googleSheets.spreadsheets.batchUpdate(request);
  return copySheet.status == 200 ? true : false;
}

// export async function newReportSheet(sheetName) {
//   const request = {
//     auth: auth,
//     spreadsheetId: sheetId,
//     resource: {
//       requests: {
//         duplicateSheet: {
//           sourceSheetId: 1776101743,
//           newSheetName: sheetName,
//         },
//       },
//     },
//   };

//   const copySheet = await googleSheets.spreadsheets.batchUpdate(request);
//   return copySheet.status == 200 ? true : false;
// }
