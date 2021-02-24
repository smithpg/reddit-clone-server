const mongoose = require("mongoose"),
  User = require("./user"),
  Comment = require("./comment"),
  Post = require("./post"),
  { PostVote, CommentVote } = require("./vote"),
  { DB_PASSWORD, DB_USER, DB_NAME, DB_CONNECTION_STRING } = process.env;

const connectionString = DB_CONNECTION_STRING ||
  process.env.NODE_ENV !== "production"
    ? "mongodb://localhost:27017/test"
    : "mongodb://localhost:27017/prod";

mongoose.connect(connectionString, {
  useNewUrlParser: true, // Use new url parser instead of default deprecated one
  useCreateIndex: true, // Ensure index is deprecated use createindex instead.
  useUnifiedTopology: true,
});

// Export all schemas
module.exports.User = User;
module.exports.Post = Post;
module.exports.Comment = Comment;
module.exports.PostVote = PostVote;
module.exports.CommentVote = CommentVote;
