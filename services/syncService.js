import projectsDto from "../dto/projectsDto.js";
import usersDto from "../dto/usersDto.js";
import { attendancesFacade } from "../facades/attendancesFacade.js";
import resultHelper from "../helpers/resultHelper.js";
import {
  setInitSheet,
  sheetLoop,
  getSheetValue,
  isLimitLoop,
} from "../helpers/sheetHelper.js";
import { isReady, STATUS_SYNCED, STATUS_SYNCING } from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { projectsRepository } from "../repositories/projectsRepository.js";
import { syncRepository } from "../repositories/syncRepository.js";
import { usersRepository } from "../repositories/usersRepository.js";

export class syncService {
  async users(res) {
    const syncRepo = new syncRepository;
    await syncRepo.setSyncStatus(STATUS_SYNCING, "Users");
    setInitSheet(process.env.SHEET_MAIN_ID, 2);

    while (true) {
      var loop = sheetLoop(10);
      var data = await getSheetValue(
        "'Users'",
        "A",
        "E",
        loop.firstIndex,
        loop.lastIndex
      );

      if (data.length == 0) {
        break;
      }

      var users = usersDto(data);
      const usersRepo = new usersRepository();
      await usersRepo.sync(users);

      if (isLimitLoop()) {
        break;
      }
    }

    await syncRepo.setSyncStatus(STATUS_SYNCED, "Users");
    return res.status(200).send(resultHelper(200, "Success"));
  }

  async projects(res) {
    const syncRepo = new syncRepository;
    await syncRepo.setSyncStatus(STATUS_SYNCING, "Projects");
    setInitSheet(process.env.SHEET_MAIN_ID, 2);

    while (true) {
      var loop = sheetLoop(20);
      var data = await getSheetValue(
        "'Projects'",
        "A",
        "D",
        loop.firstIndex,
        loop.lastIndex
      );

      if (data.length == 0) {
        break;
      }
      
      var projects = projectsDto(data);
      const projectsRepo = new projectsRepository();
      projectsRepo.sync(projects);

      if (isLimitLoop()) {
        break;
      }
    }

    await syncRepo.setSyncStatus(STATUS_SYNCED, "Projects");
    return res.status(200).send(resultHelper(200, "Success"));
  }

  async attendances(req, res) {
    try {
      const projectsRepo = new projectsRepository();
      const project = await projectsRepo.findByProjectName(
        req.user.projectName
      );

      const attendancesRepo = new attendancesRepository(project.projectName);
      const sync = await attendancesRepo.findAttendancesSync();

      if (!isReady(sync.status)) {
        return res.status(400).send(resultHelper(400, "Still " + sync.status));
      }

      await attendancesRepo.setSyncStatus(STATUS_SYNCING);

      const facade = new attendancesFacade(project);
      facade.sync();

      return res.status(200).send(resultHelper(200, "Success"));
    } catch (e) {
      console.error("Error repo sync users: ", e);
      return res.status(400).send(resultHelper(400, e));
    }
  }
}
