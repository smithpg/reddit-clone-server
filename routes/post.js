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
const Joi = require("joi");
const createError = require("http-errors");

/*
    GET all posts
*/
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user", "username");

    res.status(200).send(posts);
  } catch (err) {
    next(createError(400, err.message));
  }
});

/*
    GET a post by ID
*/
router.get("/:post_id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.post_id).populate(
      "user",
      "username"
    );

    // Attach comments
    const comments = await Comment.find({ post: post.id }).populate(
      "user",
      "username"
    );

    post.comments = comments;

    res.status(200).send(post);
  } catch (err) {
    next(createError(400, err.message));
  }
});

/*
    Create a post
*/
router.post("/", decodeToken, async (req, res, next) => {
  try {
    // Validate the post data
    const validationResult = postSchema.validate(req.body);
    if (validationResult.error) {
      return next(createError(400, validationResult.error));
    }

    // Create a new post document
    const data = { ...req.body, user: req.user._id };
    const post = new Post(data);
    await post.save();

    // Return new document as JSON
    res.status(201).send(post.toJSON());
  } catch (error) {
    next(createError(500, error.message));
  }
});

/*
    Edit a post
*/
router.put("/:post_id", decodeToken, async (req, res, next) => {
  try {
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

const postSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
});

module.exports = router;
