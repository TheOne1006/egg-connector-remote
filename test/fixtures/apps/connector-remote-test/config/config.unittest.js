'use strict';

module.exports = () => {
  const config = {
    logger: {
      level: 'NONE',
      consoleLevel: 'NONE',
    },
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
    connectorRemote: {
      enable: true,
      registerRemote: false,
    },
  };

  return config;
};
