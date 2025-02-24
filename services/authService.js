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

    return res.status(200).send(resultHelper(200, "Success", token));
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
