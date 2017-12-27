'use strict';
const _ = require('lodash');
const createSwagger = require('./createSwagger');
const loadRegisterRemote = require('./registerRemote');

module.exports = app => {
  // default
  app.swagger = {};

  const defaultConfig = {
    modelsPath: 'model.models',
    registerRemote: true, // 全局函数注册 Remote
    swaggerDefinition: {
      info: { // API informations (required)
        title: 'theone.io', // Title (required)
        version: '1.0.0', // Version (required)
        description: 'swagger service description', // Description (optional)
      },
      basePath: '/api/v1',
    },
  };
  const config = Object.assign(defaultConfig, app.config.connectorRemote);

  let ModelCollection = [];
  if (typeof config.modelsPath === 'function') {
    ModelCollection = config.modelsPath(app);
  } else if (typeof config.modelsPath === 'string') {
    ModelCollection = _.result(app, config.modelsPath);
  }

  // validate
  let ModelArray = [];

  if (!Array.isArray(ModelCollection)) {
    ModelArray = _.map(ModelCollection, item => item);
  } else {
    ModelArray = ModelCollection;
  }

  const validateModels = ModelArray.filter(Model => {
    return Model.settings && Model.remotes;
  });

  const swaggerDefinition = config.swaggerDefinition;
  const swagger = createSwagger.init(swaggerDefinition, validateModels);
  app.swagger = swagger;

  if (config.registerRemote) {
    // 注册 app.registerRemote 方法
    loadRegisterRemote(app, config);
  }
};
