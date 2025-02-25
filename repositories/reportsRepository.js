import firestoreHelper from "../helpers/firestoreHelper.js";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import reportAttendanceDto from "../dto/reportAttendanceDto.js";
import { getDateNow, getTimeNow } from "../helpers/dateHelper.js";

const db = firestoreHelper();

export class reportsRepository {
  constructor(projectName) {
    this.projectName = projectName;
  }

  async findTodayById(qrId) {
    try {
      const date = getDateNow();
      var docRef = doc(db, "Reports", this.projectName, date, qrId);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }

  async takeAttendance(attendance) {
    const date = getDateNow();
    var docRef = doc(
      db,
      "Reports",
      this.projectName,
      date,
      attendance.id
    );

    var reportAttendance = reportAttendanceDto(attendance);
    reportAttendance["Absen"] = "Hadir";
    reportAttendance["Waktu Absen"] = getTimeNow();

    await setDoc(docRef, reportAttendance);
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

    const q = query(docRef, where("Absen", "==", "Hadir"));
    const querySnapshot = await getDocs(q);

    data = [];
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    return date;
  }
}
