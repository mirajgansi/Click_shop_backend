import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Authentication Integratoin Test", () => {
  //descibe test suite
  const testUser = {
    //where to run
    username: "test gansi", //according to your uesrMOdel
    email: "TESt@test.com",
    password: "password123",
    confirmPassword: "password123",
  };
  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
  });
  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
  });
  describe("POST /api/auth/register", () => {
    // nested describe block
    test(// actual test case
    "should register a new user", async () => {
      // test case description
      // test case implementation
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully",
      );
    });
  });
});
