'use strict';
const _ = require('lodash');
const createController = require('./createController');

module.exports = (app, config) => {
  const basePath = config.swaggerDefinition.basePath;

  function registerRemote(Model, customCtrl) {
    const modelName = Model.name && Model.name.toLowerCase();
    const settings = Model.settings;
    const remotes = Model.remotes;
    const ctrl = customCtrl || createController(app, Model);

    const modelPlural = settings.plural || `${modelName}s`; // 这里不做复杂的复数转换
    _.each(remotes, (remote, key) => {
      const verb = remote.http && remote.http.verb || 'get';
      const path = _.trimEnd(remote.http && remote.http.path, '/');
      app[verb](`${basePath}/${modelPlural}${path}`, ctrl[key]);
    });
  }

  app.registerRemote = registerRemote;
};
