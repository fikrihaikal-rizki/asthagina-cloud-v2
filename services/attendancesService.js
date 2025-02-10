import reportAttendanceDto from "../dto/reportAttendanceDto.js";
import resultHelper from "../helpers/resultHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { reportsRepository } from "../repositories/reportsRepository.js";

export class attendancesService {
  async take(req, res) {
    try {
      const attendancesRepo = new attendancesRepository(req.user.projectName);
      const attendance = await attendancesRepo.findByQrId(req.body.qrId);

      if (attendance == null) {
        return res.status(400).send(resultHelper(400, "Not found!"));
      }

      const reportsRepo = new reportsRepository(req.user.projectName);
      const report = await reportsRepo.findTodayByQrId(req.body.qrId);

      if (report != null) {
        return res.status(400).send(resultHelper(400, "Already taken"));
      }

      await reportsRepo.takeAttendance(attendance);
      return res.status(200).send(resultHelper(200, "Success", reportAttendanceDto(attendance)));
    } catch (error) {}

    return res.status(200).send(resultHelper(200, "Success"));
  }
}
