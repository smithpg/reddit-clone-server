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
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  points: {
    type: Number,
    default: 1,
  },
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
      const Comment = mongoose.model("Comment");

      const post = await Post.findById(this.post);
      const user = await User.findById(this.user);

      post.comments.push(this.id);
      post.save();

      user.comments.push(this.id);
      user.save();

      if (this.parent) {
        const parent = await Comment.findById(this.parent);
        parent.children.push(this.id);
        parent.save();
      }

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

commentSchema.pre("save", function (next) {
  //TODO: Add a field for `editedAt` that reflects time
  // of last update to `text` field
  this.updatedAt = new Date();
  next();
});

commentSchema.methods.isOwnedBy = function (userId) {
  return this.user.toString() === userId;
};

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;
