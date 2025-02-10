import "dotenv/config";
import bodyParser from "body-parser";
import express from "express";
import { syncService } from "./services/syncService.js";
import { authService, verifyToken } from "./services/authService.js";
import { attendancesService } from "./services/attendancesService.js";
import { reportsService } from "./services/reportsService.js";
import cors from "cors";

import { Auth, google } from "googleapis";

const app = express();
const port = process.env.APP_PORT || 9005;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

app.post("/login", async (req, res) => {
  // const auth = new Auth.GoogleAuth({
  //   keyFile: "googleappis.json",
  //   scopes: "https://www.googleapis.com/auth/spreadsheets",
  // });

  // const client = await auth.getClient();
  // const googleSheets = google.sheets({ version: "v4", auth: client });

  // const spreadsheetId = process.env.SHEET_MAIN_ID;

  // const getRows = await googleSheets.spreadsheets.values.get({
  //   auth,
  //   spreadsheetId,
  //   range: "Users!A:A",
  // });

  // const getRows = await googleSheets.spreadsheets.values.get({
  //   auth,
  //   spreadsheetId,
  //   range: "Users!A:E",
  // });

  const service = new authService();
  return await service.login(req, res);
});

app.post("/sync/users", verifyToken, async (_, res) => {
  const service = new syncService();
  return await service.users(res);
});

app.post("/sync/projects", verifyToken, async (_, res) => {
  const service = new syncService();
  return await service.projects(res);
});

app.post("/sync/attendances", verifyToken, async (req, res) => {
  const service = new syncService();
  return await service.attendances(req, res);
});

app.post("/attendances/take", verifyToken, async (req, res) => {
  const service = new attendancesService();
  return await service.take(req, res);
});

app.post("/reports/generate", verifyToken, async (req, res) => {
  const service = new reportsService();
  return await service.generate(req, res);
});

app.listen(port, () => {
  console.log("Runnning at port " + port);
});
