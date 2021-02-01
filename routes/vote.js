const {
  User,
  Post,
  Comment,
  PostVote,
  CommentVote,
} = require("../models/index");
const { decodeToken } = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const createError = require("http-errors");

/*
    Vote on a post
*/
router.post("/post/:post_id", decodeToken, async (req, res, next) => {
  try {
    const isUpvote = req.query.isUpvote === "true";

    // If the user has already voted on this post ...
    const existingVote = await PostVote.findOne({
      user: req.user,
      post: req.params.post_id,
    });

    if (existingVote) {
      // Update document if vote direction has changed ...
      if (existingVote.isUpvote !== isUpvote) {
        existingVote.isUpvote = !existingVote.isUpvote;
        await existingVote.save();
      }
    } else {
      const vote = new PostVote({
        user: req.user,
        post: req.params.post_id,
        isUpvote,
      });
      await vote.save();
    }

    const post = await Post.findById(req.params.post_id);
    const points = await post.updatePoints();

    res.status(203).send({ points });
  } catch (error) {
    next(createError(500, error.message));
  }
});
/*
    Vote on a comment
*/
router.post("/comment/:comment_id", decodeToken, async (req, res, next) => {
  try {
    const isUpvote = req.query.isUpvote === "true";

    // If the user has already voted on this comment ...
    const existingVote = await CommentVote.findOne({
      user: req.user,
      comment: req.params.comment_id,
    });

    if (existingVote) {
      // Update document if vote direction has changed ...
      if (existingVote.isUpvote !== isUpvote) {
        existingVote.isUpvote = !existingVote.isUpvote;
        await existingVote.save();
      }
    } else {
      const vote = new CommentVote({
        user: req.user,
        comment: req.params.comment_id,
        isUpvote,
      });
      await vote.save();
    }

    const comment = await Comment.findById(req.params.comment_id);
    const points = await comment.updatePoints();

    res.status(203).send({ points });
  } catch (error) {
    next(createError(500, error.message));
  }
});

router.get("/user", decodeToken, async (req, res) => {
  /* Return a record of votes the ID'd user has cast: 
  { 
    posts: { 
      <post_id> : 1,
      <post_id> : -1,
    },
    comments: { 
      <comment_id> : 1,
      <comment_id> : -1,
    },
  }
  */

  let votes;
  const voteQuery = { user: req.user };

  if (req.query.post) {
    // fiter by post ID if one has been specified
    voteQuery.post = req.query.post;
  }

  const postVotes = await PostVote.find(voteQuery);
  const commentVotes = await CommentVote.find(voteQuery);

  const posts = postVotes
    ? postVotes.reduce((acc, v) => {
        acc[v.post] = v.isUpvote ? 1 : -1;
        return acc;
      }, {})
    : null;

  const comments = commentVotes
    ? commentVotes.reduce((acc, v) => {
        acc[v.comment] = v.isUpvote ? 1 : -1;
        return acc;
      }, {})
    : null;

  votes = {
    posts,
    comments,
  };

  res.send(votes);
});

router.delete("/", decodeToken, async (req, res, next) => {
  if (req.query.post) {
    const vote = await PostVote.findOne({
      post: req.query.post,
      user: req.user,
    });
    console.log(vote);
    await vote.remove();

    const post = await Post.findById(req.query.post);
    const points = await post.updatePoints();

    res.status(200).send({ points });
  } else if (req.query.comment) {
    const vote = await CommentVote.findOne({
      comment: req.query.comment,
      user: req.user,
    });
    await vote.remove();

    const comment = await Comment.findById(req.query.comment);
    const points = await comment.updatePoints();

    res.status(200).send({ points });
  } else {
    return next(
      createError(400, "Must include post or comment ID in query parameter")
    );
  }
});

module.exports = router;