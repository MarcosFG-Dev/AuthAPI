const { errorResponse } = require("../http/response");

function notFoundHandler(req, res) {
  return res.status(404).json(
    errorResponse({
      message: "Resource not found",
      code: "NOT_FOUND",
    })
  );
}

module.exports = notFoundHandler;
