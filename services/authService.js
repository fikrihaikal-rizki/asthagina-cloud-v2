import jsonwebtoken from "jsonwebtoken";
import loginDto from "../dto/loginDto.js";
import resultHelper from "../helpers/resultHelper.js";
import { usersRepository } from "../repositories/usersRepository.js";

const jwt = jsonwebtoken;
const secret = process.env.APP_KEY;

export class authService {
  async login(req, res) {
    const login = loginDto(req);

    const usersRepo = new usersRepository();
    var user = await usersRepo.findByUsername(login.username);
    if (user == null) {
      return res
        .status(401)
        .send(resultHelper(401, "Wrong username or password"));
    }

    if (user.password != login.password) {
      return res
        .status(401)
        .send(resultHelper(401, "Wrong username or password"));
    }

    var body = { username: user.username, projectName: user.projectName };
    var token = jwt.sign(body, secret);

    var encodedRole = Buffer.from(user.role.padEnd(10, "0")).toString("base64");

    return res
      .status(200)
      .send(resultHelper(200, "Success", { token: token + encodedRole }));
  }
}

export const verifyToken = (req, res, next) => {
  var token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  token = token.replace("Bearer ", "");
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

export const verifyHash = (req, res, next) => {
  var token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  token = token.replace("Bearer ", "");
  jwt.verify(token, process.env.COUPON_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

export const verifyUserAdmin = async (req, res, next) => {
  var credentials = req.headers["authorization"];
  if (!credentials) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const auth = new Buffer.from(credentials.split(" ")[1], "base64")
    .toString()
    .split(":");
  const username = auth[0];
  const password = auth[1];

  const usersRepo = new usersRepository();
  var user = await usersRepo.findByUsername(username);
  if (user == null) {
    return res.status(401).send(resultHelper(401, "Unautorized"));
  }

  if (user.password != password) {
    return res.status(401).send(resultHelper(401, "Unautorized"));
  }

  if (user.role != "Admin") {
    return res.status(401).send(resultHelper(401, "Unautorized"));
  }

  next();
};
