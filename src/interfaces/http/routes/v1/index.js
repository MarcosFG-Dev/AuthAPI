const express = require("express");
const buildAuthRoutes = require("./authRoutes");

function buildV1Router(dependencies) {
  const router = express.Router();
  router.use("/auth", buildAuthRoutes(dependencies));
  return router;
}

module.exports = buildV1Router;
