const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const bcrypt = require("bcrypt");
const en = require("../locales/en/translation.json");
const tr = require("../locales/tr/translation.json");

beforeAll(async () => {
  if (process.env.NODE_ENV === "test") {
    await sequelize.sync(); // initilize db
  }
});

beforeEach(async () => {
  await User.destroy({
    truncate: {
      cascade: true,
    },
  });
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

const putUser = async (id = 1, body = null, options = {}) => {
  let agent = request(app);
  let token;
  if (options.auth) {
    const res = await agent.post("/api/1.0/auth").send(options.auth);
    token = res.body.token;
  }

  agent = request(app).put(`/api/1.0/users/${id}`);

  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  if (token) {
    agent.set("Authorization",`Bearer ${token}`);
  }

  if(options.token) {
    agent.set("Authorization",`Bearer ${options.token}`);
  }
  return agent.send(body);
};

describe("User Update Route:", () => {
  it("returns forbidden when request sent without basic authorization:", async () => {
    const res = await putUser();
    expect(res.status).toBe(403);
  });

  it.each`
    language | message
    ${"tr"}  | ${tr.unauthroized_user_update}
    ${"en"}  | ${en.unauthroized_user_update}
  `(
    "returns $message when updating user details when set to $language",
    async ({ language, message }) => {
      const nowInMilliSeconds = new Date().getTime();
      const fiveSecondsFromrequest = nowInMilliSeconds * 5;
      const response = await putUser(1, null, { language });
      const errors = response.body;
      expect(errors.path).toBe(`/api/1.0/users/1`);
      expect(errors.timestamp).toBeGreaterThan(nowInMilliSeconds);
      expect(errors.timestamp).toBeLessThan(fiveSecondsFromrequest);
      expect(errors.message).toBe(message);
    }
  );

  test("should return forbidden request sent with incorrect email in basic authorization", async () => {
    await addUser();
    const response = await putUser(1, null, {
      auth: {
        email: "user10000@gmail.com",
        password: "P$4ssword",
      },
    });
    expect(response.status).toBe(403);
  });
  test("should return forbidden request sent with incorrect email in basic authorization", async () => {
    await addUser();
    const response = await putUser(1, null, {
      auth: {
        email: "user1@gmail.com",
        password: "password",
      },
    });
    expect(response.status).toBe(403);
  });
  test("should return forbidden request is sent with correct credentials but for different users", async () => {
    await addUser();
    const userToBeUpdated = await addUser({
      ...activeUser,
      username: "user2",
      email: "user2@gmail.com",
    });
    const response = await putUser(userToBeUpdated.id, null, {
      auth: {
        email: "user1@gmail.com",
        password: "P$4ssword",
      },
    });
    expect(response.status).toBe(403);
  });

  test("should return forbidden request is sent by inactive user with correct credentials for its own user", async () => {
    const inactivUser = await addUser({ ...activeUser, inactive: true });
    const response = await putUser(inactivUser.id, null, {
      auth: {
        email: "user1@gmail.com",
        password: "P$4ssword",
      },
    });
    expect(response.status).toBe(403);
  });

  test("should return 200 ok when valid update request sent from authorized user", async () => {
    const savedUser = await addUser();
    const validUpdate = { username: "user1-updated" };
    const response = await putUser(savedUser.id, validUpdate, {
      auth: {
        email: savedUser.email,
        password: "P$4ssword",
      },
    });
    expect(response.status).toBe(200);
  });

  test("should updates username in database when valid update request is sent from user", async () => {
    const savedUser = await addUser();
    const validUpdate = { username: "user1-updated" };
    await putUser(savedUser.id, validUpdate, {
      auth: {
        email: savedUser.email,
        password: "P$4ssword",
      },
    });

    const inDdUser = await User.findOne({ where: { id: savedUser.id } });

    expect(inDdUser.username).toBe(validUpdate.username);
  });
  test("return 403 when token is not valid", async () => {
    const response = await putUser(5, null, {token:'123'});
    expect(response.status).toBe(403);
  });
});
