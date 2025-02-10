import attendancesDto from "../dto/attendancesDto.js";
import {
  setInitSheet,
  sheetLoop,
  getSheetValue,
  isLimitLoop,
  setApiKey,
} from "../helpers/sheetHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";

export class attendancesFacade {
  constructor(project) {
    this.projectName = project.projectName;
    this.apiKey = project.apiKey;
    this.sheetAttendanceId = project.sheetAttendanceId;
  }

  async sync() {
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

      if (data.length == 0) {
        break;
      }

      var attendances = attendancesDto(data);
      const attendancesRepo = new attendancesRepository(this.projectName);
      attendancesRepo.sync(attendances);

      if (isLimitLoop()) {
        break;
      }

      break;
    }
  }
}
