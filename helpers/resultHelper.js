import { getDateTimeNow } from "./dateHelper.js";

export default function (code = 200, message = "", data = null) {
  var body = {
    status: true,
  };

  body.message = message;
  if (code != 200) {
    body.status = false;
  }

  if (data != null) {
    body.data = data;
  }

  body.date = getDateTimeNow();

  return body;
}
