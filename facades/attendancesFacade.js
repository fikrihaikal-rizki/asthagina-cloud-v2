import attendancesDto from "../dto/attendancesDto.js";
import {
  setInitSheet,
  sheetLoop,
  getSheetValue,
  setApiKey,
} from "../helpers/sheetHelper.js";
import { STATUS_SYNCED } from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";

export class attendancesFacade {
  constructor(project) {
    this.projectName = project.projectName;
    this.apiKey = project.apiKey;
    this.sheetAttendanceId = project.sheetAttendanceId;
  }

  async sync(revoke = false) {
    setApiKey(this.apiKey);
    setInitSheet(this.sheetAttendanceId, 2);

    while (true) {
      var loop = sheetLoop(10);
      var data = await getSheetValue(
        "'Form Responses 1'",
        "A",
        "O",
        loop.firstIndex,
        loop.lastIndex
      );

      const attendancesRepo = new attendancesRepository(this.projectName);

      if (data.length == 0) {
        await attendancesRepo.setSyncStatus(STATUS_SYNCED);
        break;
      }

      var attendances = attendancesDto(data);
      attendancesRepo.sync(attendances, revoke);
    }
  }
}
