/* eslint-disable no-undef */

const request = require("supertest");
// const { describe, expect, test } = require("@jest/globals");
const app = require("../app");
require("dotenv").config();
const mongoose = require("mongoose");
const { MONGO_URL, PORT } = process.env;

const goodParams = { email: "leonidasswds@gmail.com", password: "12345asaawd" };

describe("Test for Login controller", () => {
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
        console.log("Failed to start server");
      });
  });

  afterAll((done) => {
    mongoose.disconnect(done);
    server.close();
  });

  test("Standard SignIn with valid credentials params, and should be return token, user.subs and user.email", async () => {
    const {
      status,
      body: {
        data: { user },
      },
    } = await request(app)
      .post("/login")
      .set("Content-type", "application/json")
      .send(goodParams);

    expect(status).toBe(200);
    // expect(typeof token).toBe("string");
    expect(typeof user).toBe("object");
    expect(typeof user.name).toBe("string");
    expect(typeof user.email).toBe("string");
    expect(typeof user.subscription).toBe("string");
  });
});
