'use strict';

const _ = require('lodash');
const BaseController = require('./BaseController');
const debug = require('debug')('egg-connector-remote:createController');

module.exports = (app, Model) => {
  const modelName = Model.name;
  const ctrlName = `${modelName}Controller`;
  const CurClass = class extends BaseController {
    // constructor() {
    //   super();
    // }
    getClassName() {
      return ctrlName;
    }
  };
  const ctrl = new CurClass();
  ctrl.MainModel = Model;

  const remotes = Model.remotes;

  _.each(remotes, (remote, key) => {
    ctrl[key] = async function() {
      const ctx = this;
      let result;
      // TODO: access 校验
      const modelId = ctx.params.id;
      const accessRemote = await app._accessCheck(ctx, modelName, Model.settings && Model.settings.acls, key, remote.accessType, modelId);
      debug('remote: %s/%s accessObject: %o', ctrlName, key, accessRemote);

      if (accessRemote && accessRemote.allow === false) {
        const error = new Error('Authorization Required');
        error.status = error.statusCode = 401;
        error.code = 'AUTHORIZATION_REQUIRED';
        throw error;
      }

      // TODO: 优化，使用缓存与缓存校验.
      // 校验字段
      debug(`remote in ${ctrlName} method ${key}`);
      debug('reomte in %s method %s', ctrlName, key);
      const args = CurClass._validateAndParseRemoteInput(ctx, remote.accepts);
      // TODO: beforeRemote 相关方法

      // XXX: isStatic 判断是否需要实例
      if (remote.isStatic) {
        // 获取 args 相关参数
        result = await Model[key](ctx, ...args);
      } else {
        const id = ctx.params.id;
        const instance = await Model.findById(id);
        result = await instance[key](ctx, ...args);
      }

      // TODO: afterRemote 相关方法

      // TODO: 格式化校验 返回信息
      // format result
      // const formatResult = CurClass._formatResult(ctx, remote.accepts);

      await ctrl.success(ctx, result);
    };
  });

  return ctrl;
};
