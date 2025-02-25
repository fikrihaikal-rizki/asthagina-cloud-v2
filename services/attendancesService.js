import jsonwebtoken from "jsonwebtoken";
import reportAttendanceDto from "../dto/reportAttendanceDto.js";
import resultHelper from "../helpers/resultHelper.js";
import { STATUS_ACTIVE } from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { linksRepository } from "../repositories/linksRepository.js";
import { reportsRepository } from "../repositories/reportsRepository.js";
import { getDateTimeNow } from "../helpers/dateHelper.js";

export class attendancesService {
  async take(req, res) {
    try {
      const attendancesRepo = new attendancesRepository(req.user.projectName);
      const attendances = await attendancesRepo.findByQrId(req.body.qrId);

      var keys = Object.keys(attendances);

      if (keys.length == 0) {
        return res.status(400).send(resultHelper(400, "Data not found!"));
      }

      var attendance = null;
      keys.forEach((item) => {
        attendance = attendances[item];
        attendance.id = item;
      });

      if (attendance == null) {
        return res.status(400).send(resultHelper(400, "Data not found!"));
      }

      const reportsRepo = new reportsRepository(req.user.projectName);
      const report = await reportsRepo.findTodayById(attendance.id);

      if (report != null) {
        return res.status(400).send(resultHelper(400, "Already taken!"));
      }

      await reportsRepo.takeAttendance(attendance);
      return res
        .status(200)
        .send(resultHelper(200, "Success", reportAttendanceDto(attendance)));
    } catch (error) {
      return res
        .status(400)
        .send(resultHelper(400, "Failed to take Attendances"));
    }
  }

  async syncStatus(req, res) {
    try {
      const attendancesRepo = new attendancesRepository(req.user.projectName);
      const sync = await attendancesRepo.findAttendancesSync();

      return res.status(200).send(resultHelper(200, "Success", sync));
    } catch (error) {
      return res
        .status(400)
        .send(resultHelper(400, "Failed get sync status Attendances"));
    }
  }

  async generateId(req, res) {
    try {
      const linksRepo = new linksRepository("");

      const currentActive = await linksRepo.getById(req.body.id);
      if (currentActive == null) {
        return res.status(400).send(resultHelper(400, "Active link not found"));
      }

      if (currentActive.status != STATUS_ACTIVE) {
        return res.status(400).send(resultHelper(400, "Active link not found"));
      }

      const linkStartDate = new Date(currentActive.startDate);
      const linkEndDate = new Date(currentActive.endDate);
      const requestTime = new Date();

      if (requestTime >= linkStartDate && requestTime <= linkEndDate) {
        const attendancesRepo = new attendancesRepository(
          currentActive.projectName
        );
        const attendances = await attendancesRepo.findByPhoneNumber(
          req.body.phone
        );

        var keys = Object.keys(attendances);

        if (keys.length == 0) {
          return res.status(400).send(resultHelper(400, "Data not found"));
        }

        if (keys.length > 1) {
          return res
            .status(400)
            .send(resultHelper(400, "Multiple phone number usage"));
        }

        const jwt = jsonwebtoken;

        var keyItem = null;
        var attend = null;
        var token = "";
        keys.forEach((item) => {
          var body = item + "|" + req.body.id + "|" + currentActive.projectName;

          token = jwt.sign(body, process.env.COUPON_KEY);
          keyItem = item;
          attend = attendances[item];

          attend["QR Code ID"] = token;
        });

        await attendancesRepo.updateQrCodeId(keyItem, token);

        var generate = (token = jwt.sign(
          currentActive.projectName + "|" + attend.id,
          process.env.COUPON_KEY
        ));
        return res.status(200).send(resultHelper(200, "Success", generate));
      }

      return res.status(400).send(resultHelper(400, "Active link not found"));
    } catch (error) {
      return res
        .status(400)
        .send(resultHelper(400, "Failed get generate Attendance id"));
    }
  }

  async findCoupon(req, res) {
    try {
      var split = req.user.split("|");
      const projectName = split[0];
      const id = split[1];

      const attendancesRepo = new attendancesRepository(projectName);
      const attendance = await attendancesRepo.findId(id);

      if (attendance == null) {
        return res.status(400).send(resultHelper(400, "Coupon not found"));
      }

      var report = reportAttendanceDto(attendance);
      report["QR Code ID"] = attendance["QR Code ID"];

      return res.status(200).send(resultHelper(200, "Success", report));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed find coupon"));
    }
  }
}
