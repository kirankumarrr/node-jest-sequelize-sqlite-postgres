const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const bcrypt = require("bcrypt");
const en = require("../locales/en/translation.json");
const tr = require("../locales/tr/translation.json");
const Token = require("../src/models/Token");

beforeAll(async () => {
  await sequelize.sync(); // initilize db
  
});

beforeEach(async () => {
  await User.destroy({ truncate: true });
});

const validUser = {
  username: "user1",
  email: "user1@gmail.com",
  password: "P$4ssword",
};

const activeUser = {
  ...validUser,
  inactive: false,
};

const addUser = async (user = { ...activeUser }) => {
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  return await User.create(user);
};

const auth = async (options = {}) => {
  let token;
  if (options.auth) {
    const res = await request(app).post("/api/1.0/auth").send(options.auth);
    token = res.body.token;
  }
  return token;
};

const deleteUser = async (id = 1, options = {}) => {
  let agent = request(app).delete(`/api/1.0/users/${id}`);

  if (options.language) {
    agent.set("Accept-Language", options.language);
  }

  if (options.token) {
    agent.set("Authorization", `Bearer ${options.token}`);
  }
  return agent.send();
};

describe("DELETE USER ::::", () => {
  it.only("returns forbidden when request sent unauthorization:", async () => {
    const res = await deleteUser();
    expect(res.status).toBe(403);
  });

  it.each`
    language | message
    ${"tr"}  | ${tr.unauthroized_user_delete}
    ${"en"}  | ${en.unauthroized_user_delete}
  `(
    "returns $message when updating user details when set to $language",
    async ({ language, message }) => {
      const nowInMilliSeconds = new Date().getTime();
      const fiveSecondsFromrequest = nowInMilliSeconds * 5;
      const response = await deleteUser(1, { language });
      const errors = response.body;
      expect(errors.path).toBe(`/api/1.0/users/1`);
      expect(errors.timestamp).toBeGreaterThan(nowInMilliSeconds);
      expect(errors.timestamp).toBeLessThan(fiveSecondsFromrequest);
      expect(errors.message).toBe(message);
    }
  );

  it("should return forbidden delete request is sent with correct credentials but for different users", async () => {
    await addUser();
    const userToBedeleted = await addUser({
      ...activeUser,
      username: "user2",
      email: "user2@gmail.com",
    });

    const token = await auth({
      auth: { username: "user2", email: "user2@gmail.com" },
    });

    const response = await deleteUser(userToBedeleted.id, { token });
    expect(response.status).toBe(403);
  });

  it("return 403 when token is not valid", async () => {
    const response = await deleteUser(5, { token: "123" });
    console.log('response :', response);
    expect(response.status).toBe(403);
  });

  //   it("should return 200 ok when valid update request sent from authorized user", async () => {
  //     const savedUser = await addUser();
  //     const validUpdate = { username: "user1-updated" };
  //     const response = await deleteUser(savedUser.id, validUpdate, {
  //       auth: {
  //         email: savedUser.email,
  //         password: "P$4ssword",
  //       },
  //     });
  //     expect(response.status).toBe(200);
  //   });

  //   it("should updates username in database when valid update request is sent from user", async () => {
  //     const savedUser = await addUser();
  //     const validUpdate = { username: "user1-updated" };
  //     await deleteUser(savedUser.id, validUpdate, {
  //       auth: {
  //         email: savedUser.email,
  //         password: "P$4ssword",
  //       },
  //     });

  //     const inDdUser = await User.findOne({ where: { id: savedUser.id } });

  //     expect(inDdUser.username).toBe(validUpdate.username);
  //   });
});
