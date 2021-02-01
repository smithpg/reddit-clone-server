const mongoose = require("mongoose"),
  { Schema } = mongoose;

const postVoteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  isUpvote: Boolean,
  createdAt: {
    type: Date,
    require: true,
    default: new Date(),
  },
});

const commentVoteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  isUpvote: Boolean,
  createdAt: {
    type: Date,
    require: true,
    default: new Date(),
  },
});

const PostVote = mongoose.model("PostVote", postVoteSchema);
const CommentVote = mongoose.model("CommentVote", commentVoteSchema);

module.exports = {
  PostVote,
  CommentVote,
};
