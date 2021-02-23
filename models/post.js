const mongoose = require("mongoose"),
  { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  points: { type: Number, default: 1 },
  commentCount: { type: Number, default: 0 },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: Date,
    require: true,
    default: new Date(),
  },
  updatedAt: Date,
});

/**
 *  Whenever a Post is saved, its _id property must be stored on 
    corresponding User.
 */
postSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const User = mongoose.model("User");
      const user = await User.findById(this.user);

      user.posts.push(this.id);
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
postSchema.post("remove", async () => {
  try {
    const User = mongoose.model("User");
    const Comment = mongoose.model("Comment");

    const post = await Post.findById(this.post);
    const user = await User.findById(this.user);

    post.comments = post.comments.filter((c) => c.id !== this.id);
    post.save();

    user.comments = user.comments.filter((c) => c.id !== this.id);
    user.save();

    if (this.parent) {
      const parent = await Comment.findById(this.parent);
      parent.children = parent.children.filter((c) => c.id !== this.id);
      parent.save();
    }

    next();
  } catch (err) {
    next(err);
  }
});

postSchema.pre("save", function (next) {
  //TODO: Add a field for `editedAt` that reflects time
  // of last update to `text` field
  this.updatedAt = new Date();
  next();
});

postSchema.methods.isOwnedBy = function (userId) {
  return this.user.toString() === userId;
};

postSchema.methods.updatePoints = async function () {
  const Vote = mongoose.model("PostVote");
  const votes = await Vote.find({ post: this._id });

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

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;
