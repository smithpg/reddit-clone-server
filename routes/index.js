const apiRouter = require("express").Router();
const authRouter = require("./auth");
const postRouter = require("./post");
const commentRouter = require("./comment");

apiRouter.use("/auth", authRouter);
apiRouter.use("/post", postRouter);
// apiRouter.use("/comment", commentRouter);

module.exports = apiRouter;
