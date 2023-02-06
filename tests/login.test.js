/* eslint-disable no-undef */

const request = require("supertest");
const app = require("../app");
require("dotenv").config();
const mongoose = require("mongoose");
const { MONGO_URL, PORT } = process.env;

const correctParams = {
  email: "leonidasswds@gmail.com",
  password: "12345asaawd",
};

describe("Test for SignIn controller", () => {
  let server;
  beforeAll(() => {
    mongoose
      .connect(MONGO_URL)
      .then(() => {
        server = app.listen(PORT, () => {
          console.log("Testing server started successful");
        });
      })
      .catch(() => {
        process.exit(1);
      });
  });
  afterAll((done) => {
    mongoose.disconnect(done);
    server.close();
  });

  test("Login with correct params, should return token, user, user.subscription and user.email", async () => {
    const {
      status,
      body: { token, user = { email, subscription } },
    } = await request(app)
      .post("/api/users/login")
      .set("Content-type", "application/json")
      .send(correctParams);

    expect(status).toBe(200);
    expect(typeof token).toBe("string");
    expect(typeof user).toBe("object");
    expect(typeof user.email).toBe("string");
    expect(typeof user.subscription).toBe("string");
  });
});
