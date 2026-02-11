const env = require("../../../shared/config/env");

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Enterprise Auth API",
    version: "1.0.0",
    description: "Enterprise-grade authentication API with JWT, refresh token rotation and reuse protection.",
  },
  servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}` }],
  tags: [{ name: "Auth" }, { name: "Health" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Validation failed" },
              details: { type: "object", nullable: true },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        responses: { 200: { description: "Alive" } },
      },
    },
    "/health/readiness": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe (checks database)",
        responses: { 200: { description: "Ready" }, 503: { description: "Not ready" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 10 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          409: { description: "Conflict" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user",
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh session using HTTP-only cookie",
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and revoke current refresh token",
        responses: { 204: { description: "No Content" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Get current user",
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
  },
};

module.exports = openApiSpec;
