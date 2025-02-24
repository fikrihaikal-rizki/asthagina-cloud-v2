import date from "date-and-time";

const now = new Date();

export function getDateTimeNow() {
  return date.format(now, "YYYY-MM-DD HH:mm:ss");
}

export function getDateNow() {
  return date.format(now, "YYYY-MM-DD");
}

export function getTimeNow() {
  return date.format(now, "HH:mm:ss");
}

export function getDateTimeFrom(dateString) {
  return date.format(
    date.parse(dateString, "YYYY-MM-DD HH:mm:ss"),
    "YYYY-MM-DD HH:mm:ss"
  );
}

export function getDateFrom(dateString) {
  return date.format(date.parse(dateString, "YYYY-MM-DD"), "YYYY-MM-DD");
}

export function getTimeFrom(dateString) {
  return date.format(date.parse(dateString, "HH:mm:ss"), "HH:mm:ss");
}

export function getAddHoursFrom(dateString, hours) {
  const newDate = new Date(dateString);
  return date.format(date.addHours(newDate, hours), "YYYY-MM-DD HH:mm:ss");
}
