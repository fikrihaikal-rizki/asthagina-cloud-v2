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
      "QR Code ID": ""
    };

    var blok = item[4];
    var nomor = item[5].padStart(2, "0");
    var kamar = item[6].replace("Kamar ", "");
    kamar = kamar.padStart(2, "0");
    var telephone = item[2];
    var id = blok + "-" + nomor + "-" + kamar + "-" + telephone;

    attendances[id] = body;
  });

  return attendances;
}
