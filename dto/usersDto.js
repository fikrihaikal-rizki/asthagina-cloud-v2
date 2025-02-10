export default function (data) {
  var users = [];
  data.forEach((item) => {
    var body = {
      username: item[0],
      password: item[1],
      projectName: item[2],
      role: item[3],
      status: item[4],
    };

    users[item[0]] = body;
  });

  return users;
}
