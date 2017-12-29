'use strict';

// const _ = require('lodash');
const acl = require('./acl');

module.exports = (app, config) => {
  if (config.accessRemote && config.accessRemote.enable) {
    // 需要 应用自行实现
    app._ctxAccessCheck = (...args) => {
      const isInRoleFunc = config.accessRemote.getMatchFunc(app);
      return acl.checkAccessForContext(isInRoleFunc, ...args);
    };
  } else {
    // 默认 开启状态
    app._ctxAccessCheck = () => true;
  }
};
