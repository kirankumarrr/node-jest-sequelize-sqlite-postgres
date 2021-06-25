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

const validUser = {
  username: "user1",
  email: "user1@gmail.com",
  password: "P$4ssword",
};

const postUser = (user = validUser) => {
  return request(app).post("/api/1.0/users").send(user);
};

describe("User Registration:👨‍💼⚙️:", () => {
  it("should return 200 ok when signup request is valid", async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it("should return success message when singup request is valid", async () => {
    const response = await postUser();
    expect(response.body.message).toBe("User created");
  });

  it("should save the user to database", async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it("should saves the username and email to database", async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe("user1");
    expect(savedUser.email).toBe("user1@gmail.com");
  });

  it("should hash the password in database", async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe("P$4ssword");
  });

  it("should return 400 when username is null", async () => {
    const response = await postUser({
      username: null,
      email: "user1@gmail.com",
      password: "P$4ssword",
    });
    expect(response.status).toBe(400);
  });

  it("should return validationErrors field in response body when validation error occures", async () => {
    const response = await postUser({
      username: null,
      email: "user1@gmail.com",
      password: "P$4ssword",
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  // Dynamic multiple tests
  // test.each([
  //   ["username", "Username cannot be null"],
  //   ["email", "Email cannot be null"],
  //   ["password", "Password cannot be null"],
  // ])("when %s is null %s is received", async (field, expectedMessage) => {
  //   const user = {
  //     ...validUser,
  //   };

  //   user[field] = null;
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors[field]).toBe(expectedMessage);
  // });
  //*NOTE : This all are invalid cases covered
  test.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${"Username cannot be null"}
    ${"username"} | ${"usr"}           | ${"Must have min 4 and max 32 characters"}
    ${"username"} | ${"a".repeat(33)}  | ${"Must have min 4 and max 32 characters"}
    ${"email"}    | ${null}            | ${"Email cannot be null"}
    ${"email"}    | ${"mail.com"}      | ${"Email is not valid"}
    ${"email"}    | ${"user.mail.com"} | ${"Email is not valid"}
    ${"email"}    | ${"user@mail"}     | ${"Email is not valid"}
    ${"password"} | ${null}            | ${"Password cannot be null"}
    ${"password"} | ${"P4ssw"}         | ${"Password must be atleast 6 characters"}
    ${"password"} | ${"allowercase"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
    ${"password"} | ${"ALLUPPERCASE"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
    ${"password"} | ${"12345654"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
    ${"password"} | ${"lowerandUPPER"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
    ${"password"} | ${"lowerand5456"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
    ${"password"} | ${"UPPER5456"}   | ${"Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"}
  `(
    "returns $expectedMessage when $field is $value",
    async ({ field, value, expectedMessage }) => {
      const user = {
        ...validUser,
      };

      user[field] = value;
      const response = await postUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    }
  );

  // it("should Username cannot be null when username is null", async () => {
  //   const response = await postUser({
  //     ...validUser,
  //     username: null,
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.username).toMatch("Username cannot be null");
  // });
  // it("should Email cannot be null when email is null", async () => {
  //   const response = await postUser({
  //     ...validUser,
  //     email: null,
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.email).toMatch("Email cannot be null");
  // });

  // it("should Password cannot be null when password is null", async () => {
  //   const response = await postUser({
  //     ...validUser,
  //     password: null,
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.password).toMatch("Password cannot be null");
  // });

  // it("should return validation error when username is less then 4 character", async () => {
  //   const response = await postUser({
  //     ...validUser,
  //     username: 'usr'
  //   });
  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Must have min 4 and max 32 characters')
  // });
  it("should return errrors for both email and username is null", async () => {
    const response = await postUser({
      ...validUser,
      username: null,
      email: null,
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(["username", "email"]);
  });
  it("should return E-mail when same already in use", async () => {
    await User.create({...validUser})
    const response = await postUser(validUser);
    const body = response.body;
    expect(body.validationErrors.email).toBe('E-mail in use')
  });
  it("should return errors for both username and email is in use", async () => {
    await User.create({...validUser})
    const response = await postUser({
      ...validUser,
      username:null
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username','email'])
  });
});
