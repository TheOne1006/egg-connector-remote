'use strict';
// const _ = require('lodash');
const helper = require('./helper');
const Controller = require('egg').Controller;

/**
 * TODO: egg 暂不支持动态插入 controller
 * const egg = require('egg');
 * egg.Controller === app.Controller
 */

/**
 * 支持 restful api
 */
class BaseController extends Controller {
  // constructor(ctx) {
  //   super(ctx);
  // }
  // 注册方法
  // static remoteMethod(name, options) {
  //   this.remotes[name] = options;
  // }
  // static beforeRemote(name, fn) {
  //   const beforeRemoteMethods = this.beforeRemotes[name];
  //   if (beforeRemoteMethods && beforeRemoteMethods.length) {
  //     this.beforeRemotes[name].push();
  //   } else {
  //     this.beforeRemotes[name] = [ fn ];
  //   }
  // }
  // static afterRemote(name, fn) {
  //   const afterRemoteMethods = this.afterRemotes[name];
  //   if (afterRemoteMethods && afterRemoteMethods.length) {
  //     this.afterRemotes[name].push();
  //   } else {
  //     this.afterRemotes[name] = [ fn ];
  //   }
  // }
  /**
   * 校验remote和分析 的输入
   * @param {Object} ctx 上下文
   * @param {Object} accepts 配置
   * @return {array} argument
   */
  static _validateAndParseRemoteInput(ctx, accepts) {
    const validateConfigs = helper.parseAcceptsToArgs(accepts);
    helper.validateCtxInput(ctx, validateConfigs);

    return helper.parseCtxInput(ctx, accepts);
  }

  success(ctx, data) {
    ctx.body = data;
  }
  // notFound(ctx, msg) {
  //   msg = msg || 'not found';
  //   ctx.throw(404, msg);
  // }
}

BaseController.afterRemotes = {};
BaseController.beforeRemote = {};
BaseController.remotes = {};

module.exports = BaseController;
