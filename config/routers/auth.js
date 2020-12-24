const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const config = require("config");

const { check, validationResult } = require("express-validator");
//@route     POST auth/login
//@desc      PUT logIn
//@access    Public
router.post(
  "/login",
  [
    [
      check("email", "Email is not valid").isEmail(),
      check("password", "Invalid Credentials").isLength({ min: 6 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).send({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).send({ msg: "Email does not Exist" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({ msg: "Wrong password" });
      }
      //jwtToken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 36000,
        },
        (e, token) => {
          if (e) {
            throw e;
          }
          res.send({ token });
        }
      );
    } catch (e) {
      res.status(500).send(e.message);
      console.log(e);
    }
  }
);

module.exports = router;
