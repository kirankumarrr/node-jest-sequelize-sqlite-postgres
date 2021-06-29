const app = require("./src/app");
const sequelize = require("./src/config/database");
const TokenService = require("./src/services/Token");
const logger = require('./src/shared/logger')
// Not to use in prod: data may loose

sequelize.sync();

TokenService.scheduleCleanup();

logger.error(`error`);
logger.warn(`warn`);
logger.info(`info`);
logger.verbose(`verbose`);
logger.debug(`debug`);
logger.silly(`silly`);

app.listen(process.env.PORT || 3000, () => {
  logger.info(`"Server·is·running·on·PORT·3000"`);
});
