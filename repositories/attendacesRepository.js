import { toArrayChunk } from "../helpers/arrayHelper.js";
import firestoreHelper from "../helpers/firestoreHelper.js";
import {
  doc,
  writeBatch,
  getDoc,
  updateDoc,
  getDocs,
  FieldPath,
} from "firebase/firestore";
import { STATUS_SYNCED } from "../helpers/statusHelper.js";
import { getDateTime } from "../helpers/dateTimeHelper.js";

const db = firestoreHelper();

async function setAttendancesBatch(projectName, keys, data) {
  const batch = writeBatch(db);

  keys.forEach((item) => {
    var docRef = doc(db, "Attendances", projectName, "Attendances List", item);
    batch.set(docRef, data[item]);
  });

  await batch.commit();
}

export class attendancesRepository {
  constructor(projectName) {
    this.projectName = projectName;
  }

  async sync(data) {
    try {
      var keys = Object.keys(data);
      var chunks = toArrayChunk(process.env.FIRESTORE_MAX_BATCH, keys);
      chunks.forEach((dataKeys) => {
        setAttendancesBatch(this.projectName, dataKeys, data);
      });
    } catch (e) {
      console.error("Error repo sync attendances: ", e);
    }

    this.setSyncStatus(STATUS_SYNCED);
  }

  async findAttendancesSync() {
    var docRef = doc(db, "Attendances", this.projectName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  }

  async setSyncStatus(status) {
    try {
      var docRef = doc(db, "Attendances", this.projectName);

      //  NOTE NEED UPDATE HOUR;

      await updateDoc(docRef, { sync: status });
    } catch (e) {
      console.error("Error repo sync attendances: ", e);
    }
  }

  async findByQrId(qrId) {
    try {
      var docRef = doc(
        db,
        "Attendances",
        this.projectName,
        "Attendances List",
        qrId
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }

  async findAll() {
    var docRef = collection(
      db,
      "Attendances",
      this.projectName,
      "Attendances List"
    );

    const querySnapshot = await getDocs(docRef);

    data = [];
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    return date;
  }
}
