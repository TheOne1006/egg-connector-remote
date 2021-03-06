'use strict';

const _ = require('lodash');
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
      modelsPath: app => _.map(app.model.models, item => item),
      registerRemote: true,
      accessRemote: {
        enable: true,
        getMatchFunc: app => app.model.Role._isInRole,
      },
    },
  };

  return config;
};
