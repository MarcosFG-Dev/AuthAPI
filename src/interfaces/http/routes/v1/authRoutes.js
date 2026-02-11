const express = require("express");
const validateRequest = require("../../middlewares/validateRequest");
const authenticate = require("../../middlewares/authenticate");
const { authLimiter } = require("../../middlewares/security");
const { registerSchema, loginSchema } = require("../../validators/authValidators");

function buildAuthRoutes({ authController, tokenService }) {
  const router = express.Router();

  router.post("/register", authLimiter, validateRequest(registerSchema), authController.register);
  router.post("/login", authLimiter, validateRequest(loginSchema), authController.login);
  router.post("/refresh", authLimiter, authController.refresh);
  router.post("/logout", authController.logout);
  router.get("/me", authenticate({ tokenService }), authController.me);

  return router;
}

module.exports = buildAuthRoutes;
