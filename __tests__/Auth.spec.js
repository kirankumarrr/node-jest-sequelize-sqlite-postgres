const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Token = require("../src/models/Token");
const sequelize = require("../src/config/database");
const bcrypt = require("bcrypt");
const en = require("../locales/en/translation.json");
const tr = require("../locales/tr/translation.json");

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

const postAuthenticaiton = async (credentials, options = {}) => {
  let agent = request(app).post("/api/1.0/auth");

  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  return agent.send(credentials);
};

const postAuthLogout = async ( options = {}) => {
  let agent = request(app).post("/api/1.0/auth/logout");

  if (options.token) {
    agent.set("Authorization", `Bearer ${options.token}`);
  }
  return agent.send();
};

describe("Authentication", () => {
  it("return 200 when credentials are correct", async () => {
    await addUser();
    const response = await postAuthenticaiton({ ...activeUser });
    expect(response.status).toBe(200);
  });

  it("return only user id , username and token when login is success", async () => {
    const user = await addUser();
    const response = await postAuthenticaiton({
      email: "user1@gmail.com",
      password: "P$4ssword",
    });
    expect(response.body.id).toBe(user.id);
    expect(response.body.username).toBe(user.username);
    expect(Object.keys(response.body)).toEqual(["id", "username", "token"]);
  });

  it("return 401 when user does not exist", async () => {
    const response = await postAuthenticaiton({
      email: "user1@gmail.com",
      password: "P$4ssword",
    });
    expect(response.status).toBe(401);
  });

  it("return proper error body when authentication fails", async () => {
    const nowInMilliSeconds = new Date().getTime();
    const fiveSecondsFromrequest = nowInMilliSeconds * 5;
    const response = await postAuthenticaiton(validUser);
    const errors = response.body;
    expect(errors.path).toBe(`/api/1.0/auth`);
    expect(errors.timestamp).toBeGreaterThan(nowInMilliSeconds);
    expect(errors.timestamp).toBeLessThan(fiveSecondsFromrequest);
    expect(Object.keys(errors)).toEqual(["path", "timestamp", "message"]);
  });

  it.each`
    language | message
    ${"tr"}  | ${tr.authentication_failure}
    ${"en"}  | ${en.authentication_failure}
  `(
    "returns $message when authentication fails when set to $language",
    async ({ language, message }) => {
      const response = await postAuthenticaiton(validUser, { language });
      expect(response.body.message).toBe(message);
    }
  );

  it("return 401 when password is wrong", async () => {
    const user = await addUser();
    const response = await postAuthenticaiton({
      email: "user1@gmail.com",
      password: "Never",
    });
    expect(response.status).toBe(401);
  });
  it("return 403 when logging in with an inactive account", async () => {
    await addUser({ ...activeUser, inactive: true });
    const response = await postAuthenticaiton(activeUser);
    expect(response.status).toBe(403);
  });

  it.each`
    language | message
    ${"tr"}  | ${tr.inactive_authentication_failure}
    ${"en"}  | ${en.inactive_authentication_failure}
  `(
    "return $message when authentication fails when set to $language",
    async ({ language, message }) => {
      await addUser({ ...activeUser, inactive: true });
      const response = await postAuthenticaiton(activeUser, { language });
      expect(response.body.message).toBe(message);
    }
  );

  it("return 401 when e-mail is not valid", async () => {
    const response = await postAuthenticaiton({ password: "Ps4word" });
    expect(response.status).toBe(401);
  });

  it("return token in response body when crendentials are correct", async () => {
    await addUser();
    const response = await postAuthenticaiton(activeUser);
    expect(response.body.token).not.toBeUndefined();
  });
});

describe("LOGOUT:::", () => {
  it("return 200 ok when unauthorized request send for logout", async () => {
    const response = await postAuthLogout();
    expect(response.status).toBe(200);
  });
  it("should remove the token from databse", async () => {
    await addUser();
    const response = await postAuthenticaiton({ ...activeUser });

    const token = response.body.token
    await postAuthLogout({token});

    const storedToken = await Token.findOne({where:{token}})

    expect(storedToken).toBeNull();
  });
});
