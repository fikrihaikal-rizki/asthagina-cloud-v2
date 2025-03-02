import {
  getAddHoursFrom,
  getDateFrom,
  getDateTimeFrom,
} from "../helpers/dateHelper.js";
import { STATUS_ACTIVE } from "../helpers/statusHelper.js";

export default function (data) {
  var date = getDateFrom(data.body.date);
  var startDate = getDateTimeFrom(data.body.startDate);
  var endDate = getAddHoursFrom(startDate, data.body.duration);

  return {
    date: date,
    startDate: startDate,
    endDate: endDate,
    status: STATUS_ACTIVE,
  };
}
