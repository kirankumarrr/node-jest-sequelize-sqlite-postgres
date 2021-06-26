const request = require("supertest");
// const nodemailStub = require("nodemailer-stub");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
const EmailService = require("../src/services/Email");
const validUser = {
  username: "user1",
  email: "user1@gmail.com",
  password: "P$4ssword",
};
beforeAll(async () => {
  await sequelize.sync(); // initilize db
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const getUsers = () => {
  return request(app).get("/api/1.0/users");
};

const getUser = (id) => {
  return request(app).get(`/api/1.0/users/${id}`);
};
const addUsers = async (activeUserCount=0, inActiveUserCount=0) => {
  for (let i = 0; i <= activeUserCount + inActiveUserCount; i++) {
    const res = await User.create({
      username: `user${i+1}`,
      email: `user${i+1}@gmail.com`,
      inactive: i >= activeUserCount,
    });
  }
};

xdescribe("Listing Users", () => {
  it("should return 200 ok when there are no user in database", async () => {
    const response = await getUsers();
    expect(response.status).toBe(200);
  });

  it("should return object as response body", async () => {
    const response = await getUsers();
    expect(response.body).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalPage: 0,
    });
  });

  it("should return 10 users in page content when there are 11 users in DB", async () => {
    await addUsers(11);
    const response = await getUsers();
    expect(response.body.content.length).toBe(10);
  });

  it("should return 6 users in page content when there are 6 active users and 5 inactive users in DB", async () => {
    await addUsers(6,5);
    const response = await getUsers();
    expect(response.body.content.length).toBe(6);
  });

  it("should return id, username and email in content array for each user", async () => {
    await addUsers(6,5);
    const response = await getUsers();
    const user = response.body.content[0];
    expect(Object.keys(user)).toEqual(['id','username','email'])
  });

  it("should return 2 as totalPages when there are 15 active and 7 inactive users", async () => {
    await addUsers(15,7);
    const response = await getUsers();
    expect(response.body.totalPage).toBe(2)
  });

  it("should return 2nd page users and page indicator when page is set as 1", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:1
    });
    expect(response.body.content[0].username).toBe('user11')
    expect(response.body.page).toBe(1)
  });
 
  it("should return first page when page is set to below zero as request parameter", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:-5
    });
    expect(response.body.page).toBe(0)
  });

  it("should return 5 users and corresponding size indicator when size is set", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:-5,
      size:5
    });
    expect(response.body.content.length).toBe(5)
  });
  
  it("should return 10 users and corresponding size indicator when size is set as 1000", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:-5,
      size:1000
    });
    expect(response.body.content.length).toBe(10)
  });

  it("should return 10 users and corresponding size indicator when size is set as 0", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:-5,
      size:0
    });
    expect(response.body.content.length).toBe(10)
  });
  it("should return as zero and size as 10 when numeric query params provided for both", async () => {
    await addUsers(11);
    const response = await getUsers().query({
      page:'page',
      size: 'size'
    });
    expect(response.body.size).toBe(10)
    expect(response.body.page).toBe(0)
  });
});

describe('Get User:', () => {
  it('return 404 when user is not found:',async () => {
    const response = await getUser(5)
    expect(response.status).toBe(404)
  })

  it.each`
    language | message
    ${'tr'} | ${"Kullanıcı bulunamadı"}
    ${'en'} | ${"User not found"}
  `("returns $message for unkown user when language is set to $language",async({language , message})=>{
    const response = await getUser(5).set("Accept-Language", language)
    expect(response.body.message).toBe(message)
  })

  it('return proper error body when user not found',async () => {
    const nowInMilliSeconds = new Date().getTime()
    const fiveSecondsFromrequest = nowInMilliSeconds  *  5
    const response = await getUser(5)
    const errors = response.body
    expect(errors.path).toBe(`/api/1.0/users/5`)
    expect(errors.timestamp).toBeGreaterThan(nowInMilliSeconds)
    expect(errors.timestamp).toBeLessThan(fiveSecondsFromrequest)
    expect(Object.keys(errors)).toEqual(['path','timestamp','message'])
  })

  it('return 200 ok when active user exist',async () => {
    const user = await User.create({...validUser,inactive:false})
    const response = await getUser(user.id)
    expect(response.status).toBe(200)
  })
 
  it('return 200 ok when active user exist',async () => {
    const user = await User.create({...validUser,inactive:false})
    const response = await getUser(user.id)
    expect(Object.keys(response.body)).toEqual(['id','username','email'])
  })

  it('return 200 ok when active user exist',async () => {
    const user = await User.create({...validUser,inactive:true})
    const response = await getUser(user.id)
    expect(response.status).toBe(404)
  })
})

