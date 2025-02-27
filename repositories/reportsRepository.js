import firestoreHelper from "../helpers/firestoreHelper.js";
import {
  collection,
  doc,
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
      var docRef = doc(db, "Reports", this.projectName, this.reportDate, attendance.id);

      var reportAttendance = reportAttendanceDto(attendance);
      reportAttendance["Status"] = STATUS_ABSEN;
      reportAttendance["Waktu Absen"] = getDateTimeNow();
      reportAttendance["Waktu Hadir"] = "";

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

    var reportAttendance = reportAttendanceDto(attendance);
    reportAttendance["Status"] = STATUS_PRESENT;
    reportAttendance["Waktu Hadir"] = getDateTimeNow();

    await updateDoc(docRef, reportAttendance);
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
}
