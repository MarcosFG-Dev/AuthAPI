const request = require("supertest");
const buildApp = require("../../src/app");
const createInMemoryDependencies = require("../helpers/inMemoryDependencies");

describe("Auth API v1 integration", () => {
  it("runs full auth flow with cookie-based refresh", async () => {
    const dependencies = createInMemoryDependencies();
    const app = buildApp(dependencies);
    const agent = request.agent(app);

    const registerRes = await agent.post("/api/v1/auth/register").send({
      email: "enterprise@example.com",
      password: "StrongPass!2026",
      name: "Enterprise Client",
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.accessToken).toBeTruthy();

    const accessToken = registerRes.body.data.accessToken;
    const meRes = await agent
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.user.email).toBe("enterprise@example.com");

    const refreshRes = await agent.post("/api/v1/auth/refresh").send({});
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeTruthy();

    const logoutRes = await agent.post("/api/v1/auth/logout");
    expect(logoutRes.statusCode).toBe(204);
  });
});
