'use strict';

module.exports = app => {
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
    connectorRemote: {
      enable: true,
      registerRemote: true,
      access: {
        getUserModel: () => app.model.user,
        getRoleModel: () => app.model.role,
        getRoleMappingModel: () => app.model.roleMapping,
      },
    },
  };

  return config;
};
