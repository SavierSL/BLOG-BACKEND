const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../model/Post");
const bycrpt = require("bcryptjs");

//validator
const { check, validationResult } = require("express-validator");
const { findOne } = require("../model/User");

//@route     POST api/post
//@desc      POST a post
//@access    Public
router.post(
  "/",
  [
    auth,
    [
      check("title", "Title is Empty").not().isEmpty(),
      check("postDescription", "Content is EMpty").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const newPost = {
        user: req.user.id,
        ...req.body,
      };
      const post = await new Post(newPost); //upload to db
      post.save();
      res.send(post);
    } catch (error) {
      res.status(500).send({ errors: error.message });
    }
  }
);

//@route     PUT api/post/:post_id
//@desc      PUT aupdate a post
//@access    Public
router.put(
  "/:post_id",
  [
    auth,
    [
      check("title", "Title is Empty").not().isEmpty(),
      check("postDescription", "Content is EMpty").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).send({ errors: errors.array() });
    }
    try {
      let updatePost = {
        ...req.body,
        user: req.user.id,
      };
      let findPost = await Post.findOneAndUpdate(
        { _id: req.params.post_id },
        { $set: updatePost },
        { new: true }
      );
      res.send(findPost);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

module.exports = router;
