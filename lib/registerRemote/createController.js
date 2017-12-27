'use strict';

const _ = require('lodash');
const BaseController = require('./BaseController');

/**
 * TODO: 公共方法处理该方法
 */
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

      // 校验字段
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
