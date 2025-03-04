import resultHelper from "../helpers/resultHelper.js";
import {
  getSheetValue,
  newReportSheet,
  setInitSheet,
} from "../helpers/sheetV2Helper.js";
import { STATUS_GENERATING } from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { linksRepository } from "../repositories/linksRepository.js";
import { projectsRepository } from "../repositories/projectsRepository.js";
import { reportsRepository } from "../repositories/reportsRepository.js";

export class reportsService {
  async generate(req, res) {
    try {
      const projectsRepo = new projectsRepository();
      const project = await projectsRepo.findByProjectName(
        req.user.projectName
      );

      if (project == null) {
        return res.status(400).send(resultHelper(400, "No Project found!"));
      }

      const reportDate = req.body.date;

      setInitSheet(project.sheetReportId);
      const newsheet = await newReportSheet(reportDate);

      if (!newsheet) {
        return res
          .status(400)
          .send(resultHelper(400, "Failed Create Sheet Report!"));
      }

      const reportsRepo = new reportsRepository(project.projectName);
      await reportsRepo.setSyncStatus(STATUS_GENERATING);
      const report = await reportsRepo.findAllPresent(reportDate);

      // var keys = Object.keys(report);
      // const attendacesRepo = new attendancesRepository(req.user.projectName);
      // await att;

      // if (report != null) {
      //   return res.status(400).send(resultHelper(400, "Already taken"));
      // }

      // await reportsRepo.takeAttendance(attendance);
      // return res.status(200).send(resultHelper(200, "Success", reportAttendanceDto(attendance)));
    } catch (error) {}

    return res.status(200).send(resultHelper(200, "Success"));
  }

  async getDate(req, res) {
    try {
      const projectsRepo = new projectsRepository();
      const project = await projectsRepo.findByProjectName(
        req.user.projectName
      );

      if (project == null) {
        return res.status(400).send(resultHelper(400, "Project not found"));
      }

      const linksRepo = new linksRepository(project.projectName);
      const allLinks = await linksRepo.getAllLinks();

      var date = [];
      allLinks.forEach((item) => {
        if (!date.includes(item.date)) {
          date.push(item.date);
        }
      });

      return res.status(200).send(resultHelper(200, "Success", date));
    } catch (error) {
      return res
        .status(400)
        .send(resultHelper(400, "Failed get report date : ", error));
    }
  }

  async summary(req, res) {
    try {
      const projectsRepo = new projectsRepository();
      const project = await projectsRepo.findByProjectName(
        req.user.projectName
      );

      if (project == null) {
        return res.status(400).send(resultHelper(400, "Project not found"));
      }

      const reportRepo = new reportsRepository(
        project.projectName,
        req.body.reportDate
      );
      const present = await reportRepo.getSummaryPresent();
      const absen = await reportRepo.getSummaryAbsen();

      var body = {
        present: present,
        absen: absen,
        total: present + absen,
      };

      return res.status(200).send(resultHelper(200, "Success", body));
    } catch (error) {
      return res
        .status(400)
        .send(resultHelper(400, "Failed get report date : ", error));
    }
  }
}
