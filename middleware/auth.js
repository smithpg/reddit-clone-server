const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");

module.exports.decodeToken = async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    /**
     *  Attempt to decode the token and attach to request object
     */
    const decoded = await jwt.decode(token);

    req.user = await User.findById(decoded._id);

    next();
  } catch (error) {
    return next(createError(401, "Sign in first."));
  }
};
