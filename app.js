//const http = require("http");
const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("express-async-errors");

const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const middleware = require("./utils/middleware");

mongoose.set("strictQuery", false);

const logger = require("./utils/logger");

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

const morgan = require("morgan");

app.use(cors());
// ????
//app.use(express.static("build"));
//app.use(express.static("dist"));
// ????
app.use(express.json());
//app.use(middleware.requestLogger);

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(middleware.tokenExtractor);
//app.use(middleware.userExtractor);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
