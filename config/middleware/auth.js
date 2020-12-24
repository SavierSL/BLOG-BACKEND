const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  //get the token
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send({ msg: "THERE IS NO TOKEN" });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;

    next();
  } catch (e) {
    res.status(401).send({ msg: e.message });
  }
};
