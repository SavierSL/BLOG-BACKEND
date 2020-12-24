const mongoose = require("mongoose");
const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String,
    required: true,
  },
  postDescription: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  comments: [
    //make sure to be the same in the routes
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  likes: {
    type: Array,
  },
});
module.exports = Post = new mongoose.model("post", PostSchema);
