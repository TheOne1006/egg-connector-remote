'use strict';
const _ = require('lodash');
const createController = require('./createController');
const debug = require('debug')('egg-connector-remote:index');

module.exports = (app, config) => {
  const basePath = config.swaggerDefinition.basePath;

  function registerRemote(Model, customCtrl) {
    const modelName = Model.name && Model.name.toLowerCase();
    const settings = Model.settings;
    const remotes = Model.remotes;
    const isCustomCtrl = !!customCtrl;

    const DefualtCtrl = !isCustomCtrl && createController(app, Model);

    const modelPlural = settings.plural || `${modelName}s`; // 这里不做复杂的复数转换
    _.each(remotes, (remote, key) => {
      const verb = remote.http && remote.http.verb || 'get';
      const path = _.trimEnd(remote.http && remote.http.path, '/');
      if (isCustomCtrl) {
        debug('use customCtrl ctrl');
        app[verb](`${basePath}/${modelPlural}${path}`, customCtrl[key]);
      } else {
        app[verb](`${basePath}/${modelPlural}${path}`, function* () {
          debug('use default ctrl');
          debug('current path is %s', `${basePath}/${modelPlural}${path}`);
          debug('current remote is %o', remote);
          // console.log(remote);
          // console.log('in custom ctrl');
          const ctx = this;
          const ctrl = new DefualtCtrl(ctx);
          const result = yield ctrl[key](ctx);
          ctrl.success(ctx, result);
        });
      }
    });
  }

  app.registerRemote = registerRemote;
};
