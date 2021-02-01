const mongoose = require("mongoose"),
  { Schema } = mongoose;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  points: { type: Number, default: 1 },
  createdAt: {
    type: Date,
    require: true,
    default: new Date(),
  },
  updatedAt: Date,
});

/**
 *  Whenever a comment is saved, its _id property must be stored on 
    corresponding User and Post documents.
 */
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Post = mongoose.model("Post");
      const User = mongoose.model("User");

      const post = await Post.findById(this.post);
      const user = await User.findById(this.user);

      post.comments.push(this.id);
      post.save();

      user.comments.push(this.id);
      user.save();

      next();
    } catch (err) {
      next(err);
    }
  }
});

/**
 *  When a comment is removed, its _id property must be removed from the corresponding Chef document.
 */
commentSchema.post("remove", async () => {
  try {
    const Post = mongoose.model("Post");
    const User = mongoose.model("User");

    const post = await Post.findById(this.post);
    const user = await User.findById(this.user);

    post.comments = post.comments.filter((c) => c.id !== this.id);
    post.save();

    user.comments = user.comments.filter((c) => c.id !== this.id);
    user.save();
  } catch (err) {
    console.log(err);
  }
});

commentSchema.pre("save", function (next) {
  //TODO: Add a field for `editedAt` that reflects time
  // of last update to `text` field
  this.updatedAt = new Date();
  next();
});

commentSchema.methods.isOwnedBy = function (userId) {
  return this.user.toString() === userId;
};

commentSchema.methods.updatePoints = async function () {
  const Vote = mongoose.model("CommentVote");
  const votes = await Vote.find({ comment: this._id });

  this.points = votes.reduce((sum, vote) => {
    if (vote.isUpvote) {
      return sum + 1;
    } else {
      return sum - 1;
    }
  }, 1);

  this.save();

  return this.points;
};

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;
