'use strict';

// const _ = require('lodash');
const acl = require('./acl');

module.exports = (app, config) => {
  if (config.accessRemote && config.accessRemote.enable) {
    // 需要 应用自行实现
    app._accessCheck = (...args) => {
      const Role = app.model.Role;
      // const Role = _.result(app, config.accessRemote.getRoleModelSelector);
      const isInRoleFunc = Role.isInRole;
      return acl.checkAccessForContext(isInRoleFunc, ...args);
    };
  } else {
    app._accessCheck = () => {};
  }
};
