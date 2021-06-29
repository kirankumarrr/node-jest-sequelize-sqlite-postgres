# node-jest-sequelize-sqlite-postgres

# when testing we are not creating new local bd 
# instead using :memory: for sqlite.


# Testing mails :Ethereal
  https://ethereal.email/

# Testing mails :Ethereal

# CREATE MIGREATE FILE 
npx sequelize-cli migration:generate --name user-inactive-column
npx sequelize-cli migration:generate --name create-token

# CREATE FIELDS WITH TABLE :
npx sequelize-cli model:generate --name user --attributes username:string,emai:string,password:string

# RUN MIGRATE
  npx sequelize-cli db:migrate

# DELETE ALL 
  npx sequelize-cli db:migrate:undo
  npx sequelize-cli db:migrate:undo:all

# CREATE SEADER : BULK INSERT | DELETE
  npx sequelize-cli seed:generate --name add-users

  npx sequelize-cli db:seed:all

# Deployment
  heroku config:set NPM_CONFIG_PRODUCTION=false YARN_PRODUCTION=false