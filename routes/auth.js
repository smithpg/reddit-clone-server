const { User } = require("../models/index");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

/**
 * Search DB for document matching body.email. If found return JSON of the following structure:
 *
 *  {
 *    token: <token string>
 *    name: <name>
 *    id: <user id>
 *  }
 *
 */

router.post("/signup", async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const token = jwt.sign(
      { _id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET
    );

    res
      .status(201)
      .send({ token, username: newUser.username, id: newUser._id });
  } catch (err) {
    // MongoError with code 11000 indicates duplicate key
    if (err.code === 11000) {
      next(createError(400, "Email already in use."));
    }
    next(createError(400, err.message));
  }
});

router.post("/login", async (req, res, next) => {
  const validationResult = loginRequestBodySchema.validate(req.body);
  if (validationResult.error) {
    return next(createError(400, validationResult.error));
  }

  let user = await User.findOne(
    { username: req.body.username },
    "password username"
  );
  if (!user) {
    return next(createError(400, "Invalid email or password"));
  }

  const isvalidpassword = await user.comparePassword(req.body.password);
  if (!isvalidpassword)
    return next(createError(400, "Invalid email or password"));

  const token = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET
  );

  res.status(200).send({ token, name: user.name, id: user._id });
});

const loginRequestBodySchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = router;
