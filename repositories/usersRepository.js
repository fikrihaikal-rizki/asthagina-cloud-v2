import { toArrayChunk } from "../helpers/arrayHelper.js";
import firestoreHelper from "../helpers/firestoreHelper.js";
import { doc, writeBatch, getDoc } from "firebase/firestore";

const db = firestoreHelper();

async function setUsersBatch(keys, data) {
  const batch = writeBatch(db);

  keys.forEach((item) => {
    var docRef = doc(db, "Users", item);
    batch.set(docRef, data[item]);
  });

  await batch.commit();
}

export class usersRepository {
  async sync(data) {
    try {
      var keys = Object.keys(data);
      var chunks = toArrayChunk(process.env.FIRESTORE_MAX_BATCH, keys);
      chunks.forEach((dataKeys) => {
        setUsersBatch(dataKeys, data);
      });
    } catch (e) {
      console.error("Error repo sync users: ", e);
    }
  }

  async findByUsername(username) {
    try {
      var docRef = doc(db, "Users", username);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (e) {
      console.error("Error repo find users by username: ", e);
    }
  }
}
