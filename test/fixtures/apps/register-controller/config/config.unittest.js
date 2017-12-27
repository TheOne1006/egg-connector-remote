'use strict';

module.exports = () => {
  const config = {
    sequelize: {
      port: '3306',
      host: '127.0.0.1',
      username: 'root',
      password: '',
      database: 'test',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
      storage: 'db/test-foo.sqlite',
      timezone: '+08:01',
    },
    keys: '123456',
  };

  return config;
};
