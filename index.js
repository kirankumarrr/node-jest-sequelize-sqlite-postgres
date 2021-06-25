const app = require('./src/app');

const sequelize = require('./src/config/database')
// Not to use in prod: data may loose
sequelize.sync({force:true});

app.listen(3000, () => {
  console.log(`"Server·is·running·on·PORT·3000"`);
});
