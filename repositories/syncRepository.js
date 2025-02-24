import firestoreHelper from "../helpers/firestoreHelper.js";
import { doc, updateDoc } from "firebase/firestore";
import { STATUS_SYNCED } from "../helpers/statusHelper.js";
import { getDateTimeNow } from "../helpers/dateHelper.js";

const db = firestoreHelper();

export class syncRepository {
  async setSyncStatus(status, Doc) {
    try {
      var docRef = doc(db, "Sync", Doc);

      var body = { status: status };
      if (status == STATUS_SYNCED) {
        body.syncedDate = getDateTimeNow();
      }

      await updateDoc(docRef, body);
    } catch (e) {
      console.error("Error repo sync " + Doc + ": ", e);
    }
  }
}
