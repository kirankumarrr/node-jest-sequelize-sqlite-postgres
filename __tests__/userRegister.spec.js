const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");

beforeAll(() => {
  return sequelize.sync(); // initilize db
});
beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe("User Registration:👨‍💼⚙️:", () => {
  const postValidUser = () => {
    return request(app).post("/api/1.0/users").send({
      username: "user1",
      email: "user1@gmail.com",
      password: "P$4ssword",
    });
  };

  it("should return 200 ok when signup request is valid", async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it("should return success message when singup request is valid", async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe("User created");
  });

  it("should save the user to database", async () => {
    await postValidUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it("should saves the username and email to database", async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe("user1");
    expect(savedUser.email).toBe("user1@gmail.com");
  });

  it("should hash the password in database", async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe("P$4ssword");
  });
});
