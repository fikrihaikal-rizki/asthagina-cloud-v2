import axios from "axios";

axios.defaults.params = {};
axios.defaults.params["key"] = process.env.SHEET_API_KEY;

const sheetUrl = process.env.SHEET_BASE_API_URL;
const loopLimit = process.env.SHEET_LOOP_LIMIT;
var sheetId = "";
var index = 0;
var firstRow = 0;
var firstIndex = 0;
var lastIndex = 0;

function getValueUrl(sheetName, firstColumn, lastColumn, startRow, endRow) {
  return (
    sheetUrl +
    sheetId +
    "/values/" +
    sheetName +
    "!" +
    firstColumn +
    startRow +
    ":" +
    lastColumn +
    endRow
  );
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
  startRow,
  endRow
) {
  var result = [];
  await axios
    .get(getValueUrl(sheetName, firstColumn, lastColumn, startRow, endRow))
    .then((response) => {
      result = response.data["values"];
      if (!result) {
        result = [];
      }
    })
    .catch((err) => {
      console.error(err);
    });

  return result;
}

export function setApiKey(apiKey) {
  axios.defaults.params["key"] = apiKey;
}
