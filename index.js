const app = require('./src/app');

const sequelize = require('./src/config/database')
sequelize.syn();

app.listen(3000, () => {
  console.log(`"Server·is·running·on·PORT·3000"`);
});
