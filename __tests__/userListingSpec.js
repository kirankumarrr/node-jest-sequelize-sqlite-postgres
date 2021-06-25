const request = require("supertest");
// const nodemailStub = require("nodemailer-stub");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const EmailService = require("../src/services/Email");

describe.only("Listing Users", () => {
  it("should return 200 ok when there are no user in database", async () => {
    const response = await request(app).get("/api/1.0/users");
    expect(response.status).toBe(200);
  });

  it("should return object as response body", async () => {
    const response = await request(app).get("/api/1.0/users");
    expect(response.body).toEqual({
        content : [],
        page: 0,
        size: 10,
        totalPage:0
    })
  });
});
