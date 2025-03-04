import firestoreHelper from "../helpers/firestoreHelper.js";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import reportAttendanceDto from "../dto/reportAttendanceDto.js";
import { getDateNow, getDateTimeNow } from "../helpers/dateHelper.js";
import { STATUS_ABSEN, STATUS_PRESENT } from "../helpers/statusHelper.js";

const db = firestoreHelper();

export class reportsRepository {
  constructor(projectName, reportDate = getDateNow()) {
    this.projectName = projectName;
    this.reportDate = reportDate;
  }

  async findTodayById(qrId) {
    try {
      var docRef = doc(db, "Reports", this.projectName, this.reportDate, qrId);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }

  async absenAttendance(attendance) {
    try {
      var docRef = doc(
        db,
        "Reports",
        this.projectName,
        this.reportDate,
        attendance.id
      );

      var reportAttendance = reportAttendanceDto(attendance);
      reportAttendance["Status"] = STATUS_ABSEN;
      reportAttendance["Waktu Absen"] = getDateTimeNow();
      reportAttendance["Waktu Hadir"] = "";
      reportAttendance["QR Code ID"] = attendance["QR Code ID"];

      await setDoc(docRef, reportAttendance);
    } catch (error) {
      console.error("Error absen attendance: ", error);
    }
  }

  async takeAttendance(attendance) {
    var docRef = doc(
      db,
      "Reports",
      this.projectName,
      this.reportDate,
      attendance.id
    );

    var dateTimeNow = getDateTimeNow();
    await updateDoc(docRef, {
      Status: STATUS_PRESENT,
      "Waktu Hadir": dateTimeNow,
    });
  }

  async setSyncStatus(status) {
    try {
      var docRef = doc(db, "Reports", this.projectName);

      //  NOTE NEED UPDATE HOUR;

      await updateDoc(docRef, { status: status });
    } catch (e) {
      console.error("Error repo sync attendances: ", e);
    }
  }

  async findAllPresent(date) {
    var docRef = collection(db, "Reports", this.projectName, date);

    const q = query(docRef, where("Status", "==", "Hadir"));
    const querySnapshot = await getDocs(q);

    data = [];
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    return date;
  }

  async getSummaryPresent() {
    var docRef = collection(db, "Reports", this.projectName, this.reportDate);

    const q = query(docRef, where("Status", "==", "Hadir"));
    const querySnapshot = await getCountFromServer(q);

    return querySnapshot.data().count;
  }

  async getSummaryAbsen() {
    var docRef = collection(db, "Reports", this.projectName, this.reportDate);

    const q = query(docRef, where("Status", "==", "Absen"));
    const querySnapshot = await getCountFromServer(q);

    return querySnapshot.data().count;
  }
}
