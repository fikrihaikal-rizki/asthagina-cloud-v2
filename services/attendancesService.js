import jsonwebtoken from "jsonwebtoken";
import reportAttendanceDto from "../dto/reportAttendanceDto.js";
import resultHelper from "../helpers/resultHelper.js";
import { STATUS_ACTIVE, STATUS_PRESENT } from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { linksRepository } from "../repositories/linksRepository.js";
import { reportsRepository } from "../repositories/reportsRepository.js";

export class attendancesService {
  async take(req, res) {
    try {
      const jwt = jsonwebtoken;
      var decodeQr = jwt.verify(req.body.qrId, process.env.COUPON_KEY);

      if (!decodeQr.includes("|")) {
        return res
          .status(400)
          .send(resultHelper(400, "Invalid QR Code format"));
      }

      decodeQr = decodeQr.split("|");
      const attendanceId = decodeQr[0];
      const linkId = decodeQr[1];
      const projectName = decodeQr[2];

      if (projectName != req.user.projectName) {
        return res
          .status(400)
          .send(
            resultHelper(400, "Invalid QR Code for " + req.user.projectName)
          );
      }

      const attendancesRepo = new attendancesRepository(req.user.projectName);
      const attendance = await attendancesRepo.findId(attendanceId);
      if (attendance == null) {
        return res
          .status(400)
          .send(resultHelper(400, "Attendance not registered"));
      }

      const linksRepo = new linksRepository(req.user.projectName);
      const link = await linksRepo.getById(linkId);
      if (link == null) {
        return res.status(400).send(resultHelper(400, "Invalid Coupon link"));
      }

      const reportsRepo = new reportsRepository(
        req.user.projectName,
        link.date
      );
      const report = await reportsRepo.findTodayById(attendance.id);
      if (report == null) {
        return res.status(400).send(resultHelper(400, "Attendance not generate Coupon"));
      }

      if (report["QR Code ID"] != req.body.qrId) {
        return res.status(400).send(resultHelper(400, "Inactive Coupon Qr Code"));
      }

      if (report["Status"] == STATUS_PRESENT) {
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
        return res
          .status(400)
          .send(resultHelper(400, "Link has been inactive"));
      }

      const linkStartDate = new Date(currentActive.startDate);
      const linkEndDate = new Date(currentActive.endDate);
      const requestTime = new Date();

      if (requestTime >= linkStartDate && requestTime <= linkEndDate) {
        const attendancesRepo = new attendancesRepository(
          currentActive.projectName
        );
        const attendances = await attendancesRepo.findByEmail(req.body.email);

        var keys = Object.keys(attendances);

        if (keys.length == 0) {
          return res.status(400).send(resultHelper(400, "Data not registered"));
        }

        if (keys.length > 1) {
          return res
            .status(400)
            .send(resultHelper(400, "Multiple email address usage"));
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
        .send(resultHelper(400, "Failed get generate Attendance id", error));
    }
  }

  async findCoupon(req, res) {
    try {
      var split = req.user.split("|");
      const projectName = split[0];
      const id = split[1];

      const attendancesRepo = new attendancesRepository(projectName);
      var attendance = await attendancesRepo.findId(id);

      if (attendance == null) {
        return res.status(400).send(resultHelper(400, "Data not registered"));
      }

      const jwt = jsonwebtoken;
      var decodeQr = jwt.verify(
        attendance["QR Code ID"],
        process.env.COUPON_KEY
      );

      decodeQr = decodeQr.split("|");
      const linkId = decodeQr[1];

      const linksRepo = new linksRepository(projectName);
      const link = await linksRepo.getById(linkId);

      if (link == null) {
        return res.status(400).send(resultHelper(400, "Link coupon not found"));
      }

      const reportRepo = new reportsRepository(projectName, link.date);
      attendance.id = id;
      attendance["QR Code ID"] = attendance["QR Code ID"];
      await reportRepo.absenAttendance(attendance);

      var attendanceData = reportAttendanceDto(attendance);
      attendanceData["QR Code ID"] = attendance["QR Code ID"];
      attendanceData.linkDate = link.date;

      return res.status(200).send(resultHelper(200, "Success", attendanceData));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed find coupon"));
    }
  }
}
