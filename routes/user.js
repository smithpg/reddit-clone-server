const { User, Post, Comment } = require("../models/index");
const { decodeToken } = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const createError = require("http-errors");

/*
    GET a user by ID
*/
router.get("/:user_id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id).populate(
      "posts comments"
    );

    res.status(200).send(user);
  } catch (err) {
    next(createError(400, err.message));
  }
});

/*
    Edit a post
*/
router.put("/:post_id", decodeToken, async (req, res, next) => {
  try {
    // Validate the post data
    const validationResult = postSchema.validate(req.body);
    if (validationResult.error) {
      return next(createError(400, validationResult.error));
    }

    // Verify that the user owns ID'd post document
    const post = await Post.findById(req.params.post_id);

    if (!post.isOwnedBy(req.user._id)) {
      return next(createError(401, "Unauthorized"));
    }

    // Merge in update to post document
    Object.assign(post, req.body);
    await post.save();

    // Return new document as JSON
    res.status(201).send(post.toJSON());
  } catch (error) {
    next(createError(500, error.message));
  }
});

/*
    Delete a post
*/
router.delete("/:post_id", decodeToken, async (req, res, next) => {
  try {
    // Verify that the user owns ID'd post document
    const post = await Post.findById(req.params.post_id);

    if (!post.isOwnedBy(req.user._id)) {
      return next(createError(401, "Unauthorized"));
    }

    // Delete the document
    await post.remove();

    // Delete related comments
    await Promise.all(
      Comment.find({ post: req.params.post_id }, (err, res) => {
        return res.remove();
      })
    );

    // Return `No Content` response
    res.status(204).send();
  } catch (error) {
    next(createError(500, error.message));
  }
});

module.exports = router;
