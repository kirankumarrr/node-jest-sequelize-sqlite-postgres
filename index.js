const app = require('./src/app');
const bcrypt = require("bcrypt");
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const TokenService = require("./src/services/Token");
const addUsers = async (activeUserCount=0, inActiveUserCount=0) => {

  const hash = await bcrypt.hash('P$4ssword',10)

  for (let i = 0; i <= activeUserCount + inActiveUserCount; i++) {
    const res = await User.create({
      username: `user${i+1}`,
      email: `user${i+1}@gmail.com`,
      inactive: i >= activeUserCount,
      password:hash
    });
  }
};


// Not to use in prod: data may loose
sequelize.sync({force:true}).then(async()=>{
  await addUsers(9)
})


TokenService.scheduleCleanup()

app.listen(3000, () => {
  console.log(`"Server·is·running·on·PORT·3000"`);
});
