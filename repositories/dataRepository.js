import firestoreHelper from "../helpers/firestoreHelper.js";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

const db = firestoreHelper();

export class dataRepository {
  async getAppliedMigration() {
    try {
      var docRef = doc(db, "data", "migration");
      const docSnap = await getDoc(docRef);

      var applied = [];
      if (docSnap.exists()) {
        applied = docSnap.data().name;
      }

      return applied;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }
}
