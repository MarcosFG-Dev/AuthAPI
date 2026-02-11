function successResponse({ data = null, message = "OK", meta = null } = {}) {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

function errorResponse({ message = "Unexpected error", code = "INTERNAL_ERROR", details = null } = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
