const request = require("supertest");
// const nodemailStub = require("nodemailer-stub");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const EmailService = require("../src/services/Email");

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
});

beforeEach(() => {
  simulateSmtpFailure = false;
  return User.destroy({ truncate: true });
});

afterAll(async () => {
  await server.close();
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

xdescribe("User Registration:👨‍💼⚙️🍾:", () => {
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

  const username_null = "Username cannot be null";
  const username_size = "Must have min 4 and max 32 characters";
  const email_null = "Email cannot be null";
  const email_invalid = "Email is not valid";
  const email_inuse = "E-mail in use";
  const password_null = "Password cannot be null";
  const password_size = "Password must be atleast 6 characters";
  const password_pattern =
    "Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters";

  test.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${username_null}
    ${"username"} | ${"usr"}           | ${username_size}
    ${"username"} | ${"a".repeat(33)}  | ${username_size}
    ${"email"}    | ${null}            | ${email_null}
    ${"email"}    | ${"mail.com"}      | ${email_invalid}
    ${"email"}    | ${"user.mail.com"} | ${email_invalid}
    ${"email"}    | ${"user@mail"}     | ${email_invalid}
    ${"password"} | ${null}            | ${password_null}
    ${"password"} | ${"P4ssw"}         | ${password_size}
    ${"password"} | ${"allowercase"}   | ${password_pattern}
    ${"password"} | ${"ALLUPPERCASE"}  | ${password_pattern}
    ${"password"} | ${"12345654"}      | ${password_pattern}
    ${"password"} | ${"lowerandUPPER"} | ${password_pattern}
    ${"password"} | ${"lowerand5456"}  | ${password_pattern}
    ${"password"} | ${"UPPER5456"}     | ${password_pattern}
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
  it(`should return ${email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser(validUser);
    const body = response.body;
    expect(body.validationErrors.email).toBe(email_inuse);
  });
  it(`should return errors for both username and ${email_inuse}`, async () => {
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
    expect(response.body.message).toBe("Email Failure");
  });

  it("does not save user to database if activation email fails", async () => {
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(0);
  });
});

xdescribe("Internationalization", () => {
  const username_null = "Kullanıcı adı boş olamaz";
  const username_size = "En az 4 en fazla 32 karakter olmalı";
  const email_null = "E-Posta boş olamaz";
  const email_invalid = "E-Posta geçerli değil";
  const password_null = "Şifre boş olamaz";
  const password_size = "Şifre en az 6 karakter olmalı";
  const password_pattern =
    "Şifrede en az 1 büyük, 1 küçük harf ve 1 sayı bulunmalıdır";
  const email_inuse = "Bu E-Posta kullanılıyor";
  const user_create_success = "Kullanıcı oluşturuldu";
  const email_failure = "E-Posta gönderiminde hata oluştu";

  test.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${username_null}
    ${"username"} | ${"usr"}           | ${username_size}
    ${"username"} | ${"a".repeat(33)}  | ${username_size}
    ${"email"}    | ${null}            | ${email_null}
    ${"email"}    | ${"mail.com"}      | ${email_invalid}
    ${"email"}    | ${"user.mail.com"} | ${email_invalid}
    ${"email"}    | ${"user@mail"}     | ${email_invalid}
    ${"password"} | ${null}            | ${password_null}
    ${"password"} | ${"P4ssw"}         | ${password_size}
    ${"password"} | ${"allowercase"}   | ${password_pattern}
    ${"password"} | ${"ALLUPPERCASE"}  | ${password_pattern}
    ${"password"} | ${"12345654"}      | ${password_pattern}
    ${"password"} | ${"lowerandUPPER"} | ${password_pattern}
    ${"password"} | ${"lowerand5456"}  | ${password_pattern}
    ${"password"} | ${"UPPER5456"}     | ${password_pattern}
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

  it(`should return ${email_inuse} when same email is already in use when language is set as turkish`, async () => {
    await User.create({ ...validUser });
    const response = await postUser(validUser, { language: "tr" });
    const body = response.body;
    expect(body.validationErrors.email).toBe(email_inuse);
  });
  it("should return success message of ${user_create_success} when singup request is valid and when language is set as turkish", async () => {
    const response = await postUser(validUser, { language: "tr" });
    expect(response.body.message).toBe(user_create_success);
  });

  it(`returns ${email_failure} message when sending email fails`, async () => {
    simulateSmtpFailure = true;
    const response = await postUser(validUser, { language: "tr" });
    expect(response.body.message).toBe(email_failure);
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
    ${"tr"}  | ${"wrong"}   | ${"Bu hesap daha önce aktifleştirilmiş olabilir ya da token hatalı"}
    ${"en"}  | ${"wrong"}   | ${"This account is either active or the token is invalid"}
    ${"tr"}  | ${"correct"} | ${"Hesabınız aktifleştirildi"}
    ${"en"}  | ${"correct"} | ${"Account is activated"}
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
