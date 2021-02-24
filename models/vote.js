const mongoose = require("mongoose"),
  { Schema } = mongoose;

const VoteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isUpvote: Boolean,
  createdAt: {
    type: Date,
    require: true,
    default: new Date(),
  },
});

VoteSchema.pre("save", async function (next) {
  const value = this.isUpvote ? 1 : -1;

  // Update `points` field on referenced document
  if (this.__t === "PostVote") {
    const post = await mongoose.model("Post").findById(this.post);

    post.points += value;
    post.save();
  } else {
    const comment = await mongoose.model("Comment").findById(this.comment);

    comment.points += value;
    comment.save();
  }
});

VoteSchema.post("remove", async function (next) {
  const value = this.isUpvote ? 1 : -1;

  // Update `points` field on referenced document
  if (this.__t === "Post") {
    const post = await mongoose.model("Post").findById(this.post);

    post.points -= value;
    post.save();
  } else {
    const comment = await mongoose.model("Comment").findById(this.comment);

    comment.points -= value;
    comment.save();
  }
});

const VoteModel = mongoose.model("Vote", VoteSchema);

const PostVote = VoteModel.discriminator(
  "PostVote",
  new mongoose.Schema({
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  })
);

const CommentVote = VoteModel.discriminator(
  "CommentVote",
  new mongoose.Schema({
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  })
);

module.exports = {
  PostVote,
  CommentVote,
};
