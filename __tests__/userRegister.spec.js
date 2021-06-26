const request = require("supertest");
// const nodemailStub = require("nodemailer-stub");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const EmailService = require("../src/services/Email");
const en = require('../locales/en/translation.json')
const tr = require('../locales/tr/translation.json')

const SMTPServer = require("smtp-server").SMTPServer;
let lastMail;
let server;
let simulateSmtpFailure = false;

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody;
      stream.on("data", (data) => {
        mailBody += data.toString();
      });
      stream.on("end", () => {
        if (simulateSmtpFailure) {
          const err = new Error("invalid mailbox");
          err.responseCode = 553;
          return callback(err); // nodemail client
        }
        lastMail = mailBody;
        callback();
      });
    },
  });
  await server.listen(8587, "localhost");
  await sequelize.sync(); // initilize db
  jest.setTimeout(20000)
});

beforeEach(async() => {
  simulateSmtpFailure = false;
  await User.destroy({ truncate: true });
});

afterAll(async () => {
  await server.close();
  jest.setTimeout(5000)
});

const validUser = {
  username: "user1",
  email: "user1@gmail.com",
  password: "P$4ssword",
};

const postUser = (user = validUser, options = {}) => {
  const agent = request(app).post("/api/1.0/users");
  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  return agent.send(user);
};

describe("User Registration:👨‍💼⚙️🍾:", () => {
  it("should return 200 ok when signup request is valid", async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it("should return success message when singup request is valid", async () => {
    const response = await postUser();
    expect(response.body.message).toBe(en.user_create_success);
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

  // const username_null = "Username cannot be null";
  // const username_size = "Must have min 4 and max 32 characters";
  // const email_null = "Email cannot be null";
  // const email_invalid = "Email is not valid";
  // const email_inuse = "E-mail in use";
  // const password_null = "Password cannot be null";
  // const password_size = "Password must be atleast 6 characters";
  // const password_pattern =
  //   "Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters";

  test.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${en.username_null}
    ${"username"} | ${"usr"}           | ${en.username_size}
    ${"username"} | ${"a".repeat(33)}  | ${en.username_size}
    ${"email"}    | ${null}            | ${en.email_null}
    ${"email"}    | ${"mail.com"}      | ${en.email_invalid}
    ${"email"}    | ${"user.mail.com"} | ${en.email_invalid}
    ${"email"}    | ${"user@mail"}     | ${en.email_invalid}
    ${"password"} | ${null}            | ${en.password_null}
    ${"password"} | ${"P4ssw"}         | ${en.password_size}
    ${"password"} | ${"allowercase"}   | ${en.password_pattern}
    ${"password"} | ${"ALLUPPERCASE"}  | ${en.password_pattern}
    ${"password"} | ${"12345654"}      | ${en.password_pattern}
    ${"password"} | ${"lowerandUPPER"} | ${en.password_pattern}
    ${"password"} | ${"lowerand5456"}  | ${en.password_pattern}
    ${"password"} | ${"UPPER5456"}     | ${en.password_pattern}
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
  it(`should return ${en.email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser(validUser);
    const body = response.body;
    expect(body.validationErrors.email).toBe(en.email_inuse);
  });
  it(`should return errors for both username and ${en.email_inuse}`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      ...validUser,
      username: null,
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(["username", "email"]);
  });

  it("creates user in inactive mode", async () => {
    await postUser();
    const user = await User.findAll();
    const savedUser = user[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("creates user in inactive mode even the request body contains inactive in the body", async () => {
    await postUser({ ...validUser, inactive: false });
    const user = await User.findAll();
    const savedUser = user[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("creates an activationToken", async () => {
    await postUser();
    const user = await User.findAll();
    const savedUser = user[0];
    expect(savedUser.activationToken).toBeTruthy();
  });
  it("sends an Account activation email with activationToken", async () => {
    await postUser();

    //Not using nodemailer
    // const lastM̥ail = nodemailStub.interactsWithMail.lastMail();
    // expect(lastMail.to[0]).toContain(validUser.email)
    // const user = await User.findAll()
    // const savedUser = user[0];
    // expect(lastMail.content).toContain(savedUser.activationToken)

    const user = await User.findAll();
    const savedUser = user[0];
    expect(lastMail).toContain(validUser.email);
    expect(lastMail).toContain(savedUser.activationToken);
  });
  it("returns 502 Bad Gateway when sending email fails", async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.status).toBe(502);
  });
  it("returns Email Failure message when sending email fails", async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.body.message).toBe(en.email_failure);
  });

  it("does not save user to database if activation email fails", async () => {
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(0);
  });
 
  it("return Validations Failure messages in error response body when validation failes", async () => {
    const response = await postUser({
      ...validUser,
      username: null,
    });
    expect(response.body.message).toBe(en.validation_failure);
  });
});

describe("Internationalization", () => {
  // const username_null = "Kullanıcı adı boş olamaz";
  // const username_size = "En az 4 en fazla 32 karakter olmalı";
  // const email_null = "E-Posta boş olamaz";
  // const email_invalid = "E-Posta geçerli değil";
  // const password_null = "Şifre boş olamaz";
  // const password_size = "Şifre en az 6 karakter olmalı";
  // const password_pattern =
  //   "Şifrede en az 1 büyük, 1 küçük harf ve 1 sayı bulunmalıdır";
  // const email_inuse = "Bu E-Posta kullanılıyor";
  // const user_create_success = "Kullanıcı oluşturuldu";
  // const email_failure = "E-Posta gönderiminde hata oluştu";
  // const validation_failure = "Girilen değerler uygun değil";

  test.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${tr.username_null}
    ${"username"} | ${"usr"}           | ${tr.username_size}
    ${"username"} | ${"a".repeat(33)}  | ${tr.username_size}
    ${"email"}    | ${null}            | ${tr.email_null}
    ${"email"}    | ${"mail.com"}      | ${tr.email_invalid}
    ${"email"}    | ${"user.mail.com"} | ${tr.email_invalid}
    ${"email"}    | ${"user@mail"}     | ${tr.email_invalid}
    ${"password"} | ${null}            | ${tr.password_null}
    ${"password"} | ${"P4ssw"}         | ${tr.password_size}
    ${"password"} | ${"allowercase"}   | ${tr.password_pattern}
    ${"password"} | ${"ALLUPPERCASE"}  | ${tr.password_pattern}
    ${"password"} | ${"12345654"}      | ${tr.password_pattern}
    ${"password"} | ${"lowerandUPPER"} | ${tr.password_pattern}
    ${"password"} | ${"lowerand5456"}  | ${tr.password_pattern}
    ${"password"} | ${"UPPER5456"}     | ${tr.password_pattern}
  `(
    "returns $expectedMessage when $field is $value when language is set as turkish",
    async ({ field, value, expectedMessage }) => {
      const user = {
        ...validUser,
      };

      user[field] = value;
      const response = await postUser(user, { language: "tr" });
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    }
  );

  it(`should return ${tr.email_inuse} when same email is already in use when language is set as turkish`, async () => {
    await User.create({ ...validUser });
    const response = await postUser(validUser, { language: "tr" });
    const body = response.body;
    expect(body.validationErrors.email).toBe(tr.email_inuse);
  });
  it(`should return success message of ${tr.user_create_success} when singup request is valid and when language is set as turkish`, async () => {
    const response = await postUser(validUser, { language: "tr" });
    expect(response.body.message).toBe(tr.user_create_success);
  });

  it(`returns ${tr.email_failure} message when sending email fails`, async () => {
    simulateSmtpFailure = true;
    const response = await postUser(validUser, { language: "tr" });
    expect(response.body.message).toBe(tr.email_failure);
  });

  it(`return ${tr.validation_failure} messages in error response body when validation failes`, async () => {
    const response = await postUser({
      ...validUser,
      username: null,
    }, { language: "tr" });
    expect(response.body.message).toBe(tr.validation_failure);
  });
});

describe("Account Activation", () => {
  it("activate the account when correct token is sent", async () => {
    await postUser();
    let users = await User.findAll();
    const token = users[0].activationToken;
    await request(app)
      .post("/api/1.0/users/token/" + token)
      .send();
    users = await User.findAll();
    expect(users[0].inactive).toBe(false);
  });
  it("remove the token from user table after succesful activation", async () => {
    await postUser();
    let users = await User.findAll();
    const token = users[0].activationToken;
    await request(app)
      .post("/api/1.0/users/token/" + token)
      .send();
    users = await User.findAll();
    expect(users[0].activationToken).toBeFalsy();
  });

  it("does not activate the account when token is wrong", async () => {
    await postUser();
    const token = "lol";
    await request(app)
      .post("/api/1.0/users/token/" + token)
      .send();
    users = await User.findAll();
    expect(users[0].inactive).toBe(true);
  });

  it("return bad request when token is wrong", async () => {
    await postUser();
    const token = "lol";
    const response = await request(app)
      .post("/api/1.0/users/token/" + token)
      .send();
    users = await User.findAll();
    expect(response.status).toBe(400);
  });

  it.each`
    language | tokenStatus  | message
    ${"tr"}  | ${"wrong"}   | ${tr.account_activation_failure}
    ${"en"}  | ${"wrong"}   | ${en.account_activation_failure}
    ${"tr"}  | ${"correct"} | ${tr.account_activation_success}
    ${"en"}  | ${"correct"} | ${en.account_activation_success}
  `(
    "return $message when wrong token is sent and lanugage is $language",
    async ({ language, tokenStatus, message }) => {
      await postUser();
      let token = "never-mind";
      if (tokenStatus === "correct") {
        let users = await User.findAll();
        token = users[0].activationToken;
      }
      const response = await request(app)
        .post("/api/1.0/users/token/" + token)
        .set("Accept-Language", language)
        .send();
      
      expect(response.body.message).toBe(message);
    }
  );
});

describe("Error Model", () => {
  it("return path, timestamp, message and validation errros in response when validation failure", async () => {
    const response = await postUser({
      ...validUser,
      username: null,
    });
    expect(Object.keys(response.body)).toEqual(['path','timestamp','message','validationErrors'])
  });

  it("return path, timestamp, message in response when request fails othern than validation errors", async () => {
    const token =  'never mind'
    const response = await request(app)
    .post("/api/1.0/users/token/" + token)
    .send();
    expect(Object.keys(response.body)).toEqual(['path','timestamp','message'])
  });

 
  it("return path in error body", async () => {
    const token =  'never-mind'
    const response = await request(app)
    .post("/api/1.0/users/token/" + token)
    .send();
    expect(response.body.path).toBe("/api/1.0/users/token/" + token)
  });

  it("return timestamp in milliseconds within 5 seconds in error body", async () => { 
    const nowInMillis= new Date().getTime()
    const fivSecondsLater= nowInMillis + 5 * 1000;
    const token =  'never mind'
    const response = await request(app)
    .post("/api/1.0/users/token/" + token)
    .send();
    expect(response.body.timestamp).toBeGreaterThan(nowInMillis)
    expect(response.body.timestamp).toBeLessThan(fivSecondsLater)
  });
});
