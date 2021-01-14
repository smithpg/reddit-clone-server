const { User, Post, Comment } = require("../models/index");
const { decodeToken } = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const createError = require("http-errors");

/*
    GET a comment by ID
*/
router.get("/:comment_id", async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);
    res.status(200).send(comment);
  } catch (err) {
    next(createError(400, err.message));
  }
});

/*
    Create a comment
*/
router.post("/", decodeToken, async (req, res, next) => {
  try {
    // Validate the comment data
    const validationResult = commentSchema.validate(req.body);
    if (validationResult.error) {
      return next(createError(400, validationResult.error));
    }

    // Create a new comment document
    const data = { ...req.body, user: req.user };
    const comment = new Comment(data);
    await comment.save();

    // Return new document as JSON
    res.status(201).send(comment.toJSON());
  } catch (error) {
    next(createError(500, error.message));
  }
});

/*
    Edit a comment
*/
router.put("/:comment_id", decodeToken, async (req, res, next) => {
  try {
    // Validate the comment data
    const validationResult = commentSchema.validate(req.body);
    if (validationResult.error) {
      return next(createError(400, validationResult.error));
    }

    // Verify that the user owns ID'd comment document
    const comment = await Comment.findById(req.params.post_id);

    if (!comment.isOwnedBy(req.user)) {
      return next(createError(401, "Unauthorized"));
    }

    // Merge in update to comment document
    Object.assign(comment, req.body);
    await comment.save();

    // Return new document as JSON
    res.status(201).send(comment.toJSON());
  } catch (error) {
    next(createError(500, error.message));
  }
});

/*
    Delete a comment
*/
router.delete("/:comment_id", decodeToken, async (req, res, next) => {
  try {
    // Verify that the user owns ID'd comment document
    const comment = await Comment.findById(req.params.post_id);

    if (!comment.isOwnedBy(req.user)) {
      return next(createError(401, "Unauthorized"));
    }

    // Delete the document
    await comment.remove();

    // Return `No Content` response
    res.status(204).send();
  } catch (error) {
    next(createError(500, error.message));
  }
});

const commentSchema = Joi.object({
  text: Joi.string().required(),
  post: Joi.string().required(),
  parent: Joi.string(),
});

module.exports = router;