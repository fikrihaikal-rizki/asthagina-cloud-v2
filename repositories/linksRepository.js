import firestoreHelper from "../helpers/firestoreHelper.js";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { STATUS_ACTIVE, STATUS_INACTIVE } from "../helpers/statusHelper.js";
import { getDateTimeNow } from "../helpers/dateHelper.js";

const db = firestoreHelper();

export class linksRepository {
  constructor(projectName) {
    this.projectName = projectName;
  }

  async getActiveQuery() {
    try {
      var result = [];

      const colRef = collection(db, "Links", this.projectName, "Links List");
      const q = query(colRef, where("status", "==", STATUS_ACTIVE));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        result[doc.id] = doc.data();
      });

      return result;
    } catch (e) {
      console.error("Error get active link: ", e);
    }
  }

  async getActiveLinkByHours(start, end) {
    try {
      var result = null;
      const startDate = new Date(start);
      const endDate = new Date(end);

      const link = await this.getActiveQuery();
      var keys = Object.keys(link);
      keys.forEach((item) => {
        var linkStartDate = new Date(link[item].startDate);
        var linkEndDate = new Date(link[item].endDate);

        if (startDate >= linkStartDate && startDate <= linkEndDate) {
          result = link[item];
        }

        if (endDate >= linkStartDate && endDate <= linkEndDate) {
          result = link[item];
        }
      });

      return result;
    } catch (e) {
      console.error("Error get active link: ", e);
    }
  }

  async revokeActiveLinks() {
    try {
      const link = await this.getActiveQuery();
      var keys = Object.keys(link);
      for (const item of keys) {
        const docRef = doc(db, "Links", this.projectName, "Links List", item);
        await updateDoc(docRef, { status: STATUS_INACTIVE });
      }
    } catch (e) {
      console.error("Error revoke active link: ", e);
    }
  }

  async addActiveLink(data) {
    try {
      const colRef = collection(db, "Links", this.projectName, "Links List");
      await addDoc(colRef, data);
    } catch (e) {
      console.error("Error revoke active link: ", e);
    }
  }

  async getById(id) {
    try {
      var linkRef = collection(db, "Links");
      var linkSnap = await getDocs(linkRef);

      var projects = [];
      linkSnap.forEach((doc) => {
        projects.push(doc.id);
      });

      var link = null;
      for (const project of projects) {
        const docRef = doc(db, "Links", project, "Links List", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          link = docSnap.data();
          link.projectName = project;
          break;
        }
      }

      if (link == null) {
        return null;
      }

      return link;
    } catch (e) {
      console.error("Error get link: ", e);
    }
  }

  async getAllLinks() {
    try {
      var result = [];

      const colRef = collection(db, "Links", this.projectName, "Links List");
      const docSnap = await getDocs(colRef);
      docSnap.forEach((doc) => {
        result.push(doc.data());
      });

      return result;
    } catch (e) {
      console.error("Error get active link: ", e);
    }
  }

  async inactive(id) {
    try {
      const colRef = doc(db, "Links", this.projectName, "Links List", id);
      await updateDoc(colRef, { status: STATUS_INACTIVE });

      return result;
    } catch (e) {
      console.error("Error get active link: ", e);
    }
  }
}
