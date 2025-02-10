export default function (attendance) {
  var address =
    "Blok " +
    attendance["Nama blok"] +
    ", No. " +
    attendance["Nomor blok"] +
    ", " +
    attendance["Nomor kamar"];

  return {
    "Nama Lengkap": attendance["Nama Lengkap"],
    "Nomor telepon": attendance["Nomor telepon"],
    Email: attendance["Email"],
    "Alamat Kos": address,
  };
}
