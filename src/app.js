const express = require("express");
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const ErrorHandler = require("./middleware/ErrorHandler");

const UserRouter = require("./routers/User");
const AuthRouter = require("./routers/Auth");

const tokenAuthentication = require('./middleware/tokenAuthenticaiton')

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

const app = express();

app.use(middleware.handle(i18next));

app.use(express.json());

app.use(tokenAuthentication)

app.use("/api", AuthRouter);
app.use("/api", UserRouter);


app.use(ErrorHandler)

module.exports = app;
