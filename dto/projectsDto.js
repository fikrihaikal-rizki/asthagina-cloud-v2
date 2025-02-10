export default function (data) {
  var projects = [];
  data.forEach((item) => {
    var body = {
      projectName: item[0],
      sheetAttendanceId: item[1],
      sheetReportId: item[2],
      apiKey: item[3],
    };

    projects[item[0]] = body;
  });

  return projects;
}

'1/19/2025 18:10:22',
'Fikrihaikal Rizki 2',
'085847391433',
'fikri15haikal@gmail.com',
'CC',
'7',
'Kamar 8',
'Jawa timur',
'Kota malang',
'jalan tawangmangu',
'ubeh',
'https://drive.google.com/open?id=1WTVtN2uCgbt5clCZsmAT3CIHYIiDxHnY',
'',
'',
'CC-7-8-085847391433'