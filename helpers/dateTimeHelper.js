export function getDateTime() {
  var dateTime = new Date().toLocaleString("id-ID").toString();
  var date = dateTime.split(",")[0].trim();
  var time = dateTime.split(",")[1].trim();
  console.log({date, time});
  // dateTime = dateTime.replace("/");
  return dateTime;
  // return (
  //   dateTime.getDate +
  //   "-" +
  //   dateTime.getMonth() +
  //   "-" +
  //   dateTime.getDate()
  // );
}

export function getDate() {}

export function getTime() {}
