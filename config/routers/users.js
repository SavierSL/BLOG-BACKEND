const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const gravatar = require("gravatar");

//validator
const { check, validationResult } = require("express-validator"); //for validation in input
const User = require("../model/User"); //we need to get the model

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { name, email, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .send({ error: [{ msg: "Email already exist" }] });
      }
      //get user avatar
      const avatar = gravatar.url(email, {
        s: "200", // size
        r: "pg", // rating to pg so no naked people
        d: "mm", // there is a default if no image
      });
      user = new User({
        // it is not yet save in the database
        name,
        email,
        avatar,
        password,
      });

      //we need to encrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //We need to return the jsonwebtoken
      const payload = {
        user: {
          id: user.id, //the id is already made from await user.save()
        },
      };
      //Token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 39000 },
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
