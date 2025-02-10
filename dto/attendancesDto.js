export default function (data) {
  var attendances = [];
  data.forEach((item) => {
    var body = {
      "Nama Lengkap": item[1],
      "Nomor telepon": item[2],
      Email: item[3],
      "Nama blok": item[4],
      "Nomor blok": item[5],
      "Nomor kamar": item[6],
      "QR Code ID": item[14],
    };

    if (item[14] != "") {
      attendances[item[14]] = body;
    }
  });

  return attendances;
}
