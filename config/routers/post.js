const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../model/Post");
const User = require("../model/User");
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

//@route     DELETE api/post/:post_id
//@desc      DELETE a post
//@access    Public
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const findPost = await Post.findByIdAndDelete(req.params.post_id);
    if (!findPost) {
      return res.status(400).send({ msg: "Invalid Id" });
    }
    res.send({ msg: "Post Deleted" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//@route     POST api/post/:post_id
//@desc      POST a like
//@access    Public
router.post("/:post_id", auth, async (req, res) => {
  try {
    const findUser = await User.findOne({ _id: req.user.id }).select(
      "-password"
    );
    if (!findUser) {
      return res.status(400).send({ msg: "Error User" });
    }
    let findPost = await Post.findById(req.params.post_id);
    const isUserExist = findPost.likes.filter((userData) => {
      const likeID = userData._id.toString();
      const userID = findUser._id.toString();
      return likeID === userID;
    });
    if (isUserExist.length > 0) {
      findPost.likes = findPost.likes.filter((userData) => {
        const likeID = userData._id.toString();
        const userID = findUser._id.toString();
        return likeID !== userID;
      });

      await findPost.save();
      return res.send(findPost);
    }
    findPost.likes.push(findUser);

    await findPost.save();
    res.send(findPost);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//@route     POST api/post/:post_id
//@desc      POST a comment
//@access    Public
router.post(
  "/comment/:post_id",
  [auth, check("text", "Comment is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const findPost = await Post.findById(req.params.post_id);
      if (!findPost) {
        return res.status(401).send({ msg: "Post can't find" });
      }
      const newComment = {
        user: req.user.id,
        ...req.body,
      };
      findPost.comments.push(newComment);
      await findPost.save();
      res.send(findPost);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

//@route     PUT api/post/comment/:post_id/:comment_id
//@desc      PUT edit a comment
//@access    Public
router.put(
  "/comment/:post_id/:comment_id",
  [auth, check("text", "Comment is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const findPost = await Post.findById(req.params.post_id);
      if (!findPost) {
        return res.status(500).send({ msg: "Post can't find" });
      }
      findPost.comments = findPost.comments.map((comment) => {
        const commentID = comment._id.toString();
        const paramID = req.params.comment_id;
        if (commentID === paramID) {
          comment.text = req.body.text;
          return comment;
        }
        return comment;
      });
      await findPost.save();
      res.send(findPost);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

//@route     DELETE api/post/comment/:post_id/:comment_id
//@desc      DELETE delete a comment
//@access    Public
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    let findPost = await Post.findById(req.params.post_id);
    if (!findPost) {
      return res.status(400).send({ msg: "Can't find post" });
    }

    findPost.comments = findPost.comments.filter((comment) => {
      const commentID = comment._id.toString();
      return commentID !== req.params.comment_id;
    });
    await findPost.save();
    res.send(findPost);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
