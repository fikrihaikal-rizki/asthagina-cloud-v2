import { dataRepository } from "../repositories/dataRepository.js";
import * as fs from "fs";

export class dataService {
  async migration(res) {
    const dataRepo = new dataRepository();
    var applied = await dataRepo.getAppliedMigration();

    const folderPath = "./migrations";
    var list = fs.readdirSync(folderPath);

    var notApplies = [];
    list.forEach((migration) => {
      if (!applied.includes(migration)) {
        notApplies.push(migration);
      }
    });

    for (const notApply of notApplies) {
      await import("../migrations/" + notApply).then((migrate) => {
        const DefaultFunction = migrate.default;
        DefaultFunction();
      });
    }

    return res.status(200).json({ message: "Success" });
  }
}
