const apiRouter = require("express").Router();

apiRouter.use("/auth", require("./auth"));
apiRouter.use("/post", require("./post"));
apiRouter.use("/user", require("./user"));
apiRouter.use("/comment", require("./comment"));
apiRouter.use("/vote", require("./vote"));

module.exports = apiRouter;
