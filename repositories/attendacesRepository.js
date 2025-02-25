import { toArrayChunk } from "../helpers/arrayHelper.js";
import firestoreHelper from "../helpers/firestoreHelper.js";
import {
  doc,
  writeBatch,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { STATUS_SYNCED } from "../helpers/statusHelper.js";
import { getDateTimeNow } from "../helpers/dateHelper.js";

const db = firestoreHelper();

async function setAttendancesBatch(projectName, keys, data, revoke) {
  const batch = writeBatch(db);

  for (const item of keys) {
    var docRef = doc(db, "Attendances", projectName, "Attendances List", item);

    if (revoke) {
      batch.set(docRef, data[item]);
    } else {
      const attendance = await getDoc(docRef);

      if (attendance.exists()) {
        var qrCodeId = attendance.data()["QR Code ID"];
        data[item]["QR Code ID"] = qrCodeId;
        batch.set(docRef, data[item]);
      } else {
        batch.set(docRef, data[item]);
      }
    }
  }

  await batch.commit();
}

export class attendancesRepository {
  constructor(projectName) {
    this.projectName = projectName;
  }

  async sync(data, revoke = false) {
    try {
      var keys = Object.keys(data);
      var chunks = toArrayChunk(process.env.FIRESTORE_MAX_BATCH, keys);
      for (const dataKeys of chunks) {
        await setAttendancesBatch(this.projectName, dataKeys, data, revoke);
      }
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

      var body = { status: status };
      if (status == STATUS_SYNCED) {
        body.syncedDate = getDateTimeNow();
      }

      await updateDoc(docRef, body);
    } catch (e) {
      console.error("Error repo sync attendances: ", e);
    }
  }

  async findByQrId(qrId) {
    try {
      var result = [];
      const colRef = collection(
        db,
        "Attendances",
        this.projectName,
        "Attendances List"
      );

      const q = query(colRef, where("QR Code ID", "==", qrId));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        result[doc.id] = doc.data();
        result[doc.id]['id'] = doc.id;
      });

      return result;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }

  async findId(id) {
    try {
      var docRef = doc(
        db,
        "Attendances",
        this.projectName,
        "Attendances List",
        id
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

  async findByPhoneNumber(phone) {
    try {
      var result = [];
      const colRef = collection(
        db,
        "Attendances",
        this.projectName,
        "Attendances List"
      );

      const q = query(colRef, where("Nomor telepon", "==", phone));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        result[doc.id] = doc.data();
        result[doc.id]['id'] = doc.id;
      });

      return result;
    } catch (e) {
      console.error("Error repo find users by phone number: ", e);
    }
  }

  async updateQrCodeId(id, qrCodeId) {
    try {
      const docRef = doc(
        db,
        "Attendances",
        this.projectName,
        "Attendances List",
        id
      );

      await updateDoc(docRef, { "QR Code ID": qrCodeId });
    } catch (e) {
      console.error("Error repo find users by phone number: ", e);
    }
  }
}
