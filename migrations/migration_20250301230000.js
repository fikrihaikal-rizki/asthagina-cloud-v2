import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import firestoreHelper from "../helpers/firestoreHelper.js";

const db = firestoreHelper();

export default async function () {
  try {
    const projectsRef = collection(db, "Projects");
    const projectsSnap = await getDocs(projectsRef);

    var projectNames = [];
    projectsSnap.forEach((doc) => {
      projectNames.push(doc.data().projectName);
    });

    if (projectNames.length == 0) {
      return;
    }

    for (const projectName of projectNames) {
      const linksRefs = collection(db, "Links", projectName, "Links List");
      const linksSnap = await getDocs(linksRefs);

      var linkDates = [];
      linksSnap.forEach((doc) => {
        if (!linkDates.includes(doc.data().date)) {
          linkDates.push(doc.data().date);
        }
      });

      if (linkDates.length == 0) {
        continue;
      }

      for (const linkDate of linkDates) {
        await updateReportQrCodeId(projectName, linkDate);
      }
    }
  } catch (error) {
    console.log("error run migration :" + error);
  }
}

async function updateReportQrCodeId(projectName, linkDate) {
  try {
    const excludeDate = ["2025-02-28", "2025-03-01", "2025-03-03"];
    const reportsRefs = collection(db, "Reports", projectName, linkDate);
    const reportsSnap = await getDocs(reportsRefs);

    var reports = [];
    reportsSnap.forEach((doc) => {
      var body = doc.data();
      body.id = doc.id;
      reports.push(body);
    });

    var reports = [];
    reportsSnap.forEach((doc) => {
      var body = doc.data();
      body.id = doc.id;
      reports.push(body);
    });

    for (const report of reports) {
      if (!excludeDate.includes(linkDate)) {
        var attendancesRef = doc(
          db,
          "Attendances",
          projectName,
          "Attendances List",
          report.id
        );
        var attendancesSnap = await getDoc(attendancesRef);
        if (attendancesSnap.exists()) {
          var reportRef = doc(db, "Reports", projectName, linkDate, report.id);
          await updateDoc(reportRef, {
            "QR Code ID": attendancesSnap.data()["QR Code ID"],
          });
        }
      }
    }
  } catch (error) {
    console.log("error run migration :" + error);
  }
}
