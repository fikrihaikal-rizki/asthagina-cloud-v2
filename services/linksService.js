import linksDto from "../dto/linksDto.js";
import { attendancesFacade } from "../facades/attendancesFacade.js";
import resultHelper from "../helpers/resultHelper.js";
import {
  isReady,
  STATUS_ACTIVE,
  STATUS_SYNCING,
} from "../helpers/statusHelper.js";
import { attendancesRepository } from "../repositories/attendacesRepository.js";
import { linksRepository } from "../repositories/linksRepository.js";
import { projectsRepository } from "../repositories/projectsRepository.js";

export class linksService {
  async generate(req, res) {
    try {
      const linksRepo = new linksRepository(req.user.projectName);
      var links = linksDto(req);
      const currentActive = await linksRepo.getActiveLinkByHours(
        links.startDate,
        links.endDate
      );

      if (currentActive !== null) {
        return res
          .status(400)
          .send(
            resultHelper(
              400,
              "Previous Link still active, Please try again after " +
                currentActive.endDate,
              currentActive
            )
          );
      }

      const revokePrevious = req.body.revokePrevious;
      if (revokePrevious) {
        const projectsRepo = new projectsRepository();
        const project = await projectsRepo.findByProjectName(
          req.user.projectName
        );

        const attendancesRepo = new attendancesRepository(project.projectName);
        const sync = await attendancesRepo.findAttendancesSync();

        if (!isReady(sync.status)) {
          return res
            .status(400)
            .send(resultHelper(400, "Still " + sync.status));
        }

        await attendancesRepo.setSyncStatus(STATUS_SYNCING);

        const facade = new attendancesFacade(project);
        facade.sync(revokePrevious);

        await linksRepo.revokeActiveLinks();
      }

      await linksRepo.addActiveLink(links);

      return res.status(200).send(resultHelper(200, "Success"));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed : " + error));
    }
  }

  async getActive(req, res) {
    try {
      const linksRepo = new linksRepository(req.user.projectName);

      const currentActive = await linksRepo.getActiveQuery();
      var keys = Object.keys(currentActive);

      if (keys.length == 0) {
        return res
          .status(400)
          .send(resultHelper(400, "There no current active link"));
      }

      var activeLinks = [];
      keys.forEach((item) => {
        var body = {
          date: currentActive[item].date,
          startDate: currentActive[item].startDate,
          endDate: currentActive[item].endDate,
          link: process.env.COUPON_BASE_URL + "l/" + item,
        };

        activeLinks.push(body);
      });

      return res.status(200).send(resultHelper(200, "Success", activeLinks));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed get Active link"));
    }
  }

  async verify(req, res) {
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
        return res.status(200).send(resultHelper(200, "Succes", currentActive));
      }

      return res.status(400).send(resultHelper(400, "Active link not found"));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed get Active link"));
    }
  }

  async inactive(req, res) {
    try {
      const linksRepo = new linksRepository(req.user.projectName);
      var id = req.body.link.toString();
      id = id.replace(process.env.COUPON_BASE_URL + "l/", "");
      await linksRepo.inactive(id);

      return res.status(200).send(resultHelper(200, "Success"));
    } catch (error) {
      return res.status(400).send(resultHelper(400, "Failed get Active link"));
    }
  }
}
