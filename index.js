const app = require("./src/app");
const sequelize = require("./src/config/database");
const TokenService = require("./src/services/Token");

// Not to use in prod: data may loose
sequelize.sync().then(async () => {
  await addUsers(9);
});

TokenService.scheduleCleanup();

app.listen(3000, () => {
  console.log(`"Server·is·running·on·PORT·3000"`);
});
