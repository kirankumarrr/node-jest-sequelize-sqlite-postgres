const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Token = require("../src/models/Token");
const sequelize = require("../src/config/database");
const TokenService = require("../src/services/Token");

const timeUtils = require("../src/Utils/time");
const tokenAuthentication = require("../src/middleware/tokenAuthenticaiton");

beforeAll(async () => {
  await sequelize.sync(); // initilize db
});

beforeEach(async () => {
  await Token.destroy({
    truncate: true,
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
    agent.set("Authorization", `Bearer ${token}`);
  }

  if (options.token) {
    agent.set("Authorization", `Bearer ${options.token}`);
  }
  return agent.send(body);
};

describe("🔑🔑🔑🔑TOKEN Service:🔑🔑🔑🔑", () => {
  describe("Schedule Token Cleanup:🔑", () => {
    it("Schedule Token :", async () => {
        jest.useFakeTimers();

      const token = "test-token";

      await Token.create({
        token,
        lastUsedAt: timeUtils.eightDaysAgo,
      });

      TokenService.scheduleCleanup();

      jest.advanceTimersByTime(60 * 60 * 1000 + 5000);

      const tokenInDb = await Token.findOne({ where: { token } });
      expect(tokenInDb).toBeNull();
    });
  });
});
