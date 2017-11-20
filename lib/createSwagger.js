'use strict';

// TODO: hash值确保相同配置不会重复执行

const _ = require('lodash');
const swaggerTemplate = require('./swaggerDefault');

// 单例模式
let swaggerRoot = {
  tags: [],
  paths: {},
  definitions: {},
  securityDefinitions: {},
};

/**
 * tool defaultSwaggerTypeAndFormatFromDescType
 * 从描述性的 type 获取默认的swagger type 和 format
 * @param {string} descType 描述性的type
 * @return {object} typeAndDesc Object
 */
function defaultSwaggerTypeAndFormatFromDescType(descType) {
  let format = '';
  let type = '';
  switch (descType) {
    case 'date':
      type = 'string';
      format = 'DATE';
      break;
    case 'buffer':
      type = 'string';
      format = 'BYTE';
      break;
    case 'number':
      type = 'number';
      format = 'int64';
      break;
    case 'integer':
      type = 'integer';
      format = 'int64';
      break;
    case 'object':
      type = 'string';
      format = 'JSON';
      break;
    default:
      type = 'string';
  }

  return {
    type,
    format,
  };
}

function convertPathFragments(path) {
  return path.split('/').map(function(fragment) {
    if (fragment.charAt(0) === ':') {
      return '{' + fragment.slice(1) + '}';
    }
    return fragment;
  }).join('/');
}

function turnParamType2In(http, acceptItem) {
  // 参数名称
  const name = acceptItem.name || acceptItem.arg;
  const sourceVerb = http && http.verb || 'get';
  const verb = sourceVerb.toLowerCase();

  // types Mapping
  const commonParamTypes = {
    get: 'query',
    post: 'formData',
    put: 'formData',
    del: 'query',
    delete: 'query',
  };

  let paramType = commonParamTypes[verb] || 'formData';
  const path = http.path;
  // path 存在参数名称, 重置 paramType
  if (path && path.indexOf(':' + name) !== -1) {
    paramType = 'path';
  }

  // 如果存在 http.source, 重置 source
  if (acceptItem.http && acceptItem.http.source) {
    paramType = acceptItem.http.source.toLowerCase();
  }

  return paramType;
}

function schemaBuildFromAccept(acceptItem) {
  if (!acceptItem.model) {
    return null;
  }

  const modelNameLowerCase = acceptItem.model.toLowerCase();

  let schema = {};

  if (acceptItem.type === 'array') {
    schema = {
      type: 'array',
      items: {
        $ref: `#/definitions/${modelNameLowerCase}`,
      },
    };
  } else {
    schema = {
      $ref: `#/definitions/${modelNameLowerCase}`,
    };
  }

  return schema;
}

function buildTypeAndFormat(acceptItem) {
  const extConfig = {};
  if (acceptItem.model) {
    return extConfig;
  }

  return defaultSwaggerTypeAndFormatFromDescType(acceptItem.type);
}

/**
 *
 * @param {Object} returnsConfig return 配置项目
 * @return {Object} response object for swagger
 */
function returnsBuildFromAccept(returnsConfig) {
  const responseMessages = {};
  const statusCode = (returnsConfig || returnsConfig.length) ? 200 : 204;
  const typeName = returnsConfig.type;
  const modelName = returnsConfig.model;

  const res = {
    description: 'Request was successful',
  };

  if (modelName) {
    if (typeName === 'array') {
      res.type = 'array';
      res.items = {
        $ref: `#/definitions/${modelName}`,
      };
    } else {
      res.schema = {
        $ref: `#/definitions/${modelName}`,
      };
    }
  } else if (typeName) {
    if (typeName === 'object' && returnsConfig.root) {
      res.schema = {
        type: 'object',
      };
    } else if (!returnsConfig.root && returnsConfig.arg) {
      let swaggerTypeAndFormat = {};
      if (typeName === 'object') {
        swaggerTypeAndFormat = {
          type: 'object',
        };
      } else {
        swaggerTypeAndFormat = defaultSwaggerTypeAndFormatFromDescType(typeName);
      }

      const propTypeAndFormat = {
        type: swaggerTypeAndFormat.type,
      };
      if (returnsConfig.format || swaggerTypeAndFormat.format) {
        propTypeAndFormat.format = returnsConfig.format || swaggerTypeAndFormat.format;
      }

      res.schema = {
        type: 'object',
        properties: {
          [returnsConfig.arg]: propTypeAndFormat,
        },
      };
    } else {
      res.type = typeName;
    }

  }

  responseMessages[statusCode] = res;

  return responseMessages;
}


function createUniqueOperationId(modelName, methodName, remoteConfig) {
  const verb = remoteConfig.http && remoteConfig.http.verb || 'get';
  const path = remoteConfig.http && remoteConfig.http.path;
  const isPrototype = !(remoteConfig && remoteConfig.isStatic);
  const pathRep = path.replace(/[\/:]+/g, '_');

  let prototypeStr = '';
  if (isPrototype) {
    prototypeStr = '.prototype';
  }

  return `${modelName}${prototypeStr}__${methodName}__${verb}_${pathRep}`;
}
/**
 * 扩展配置文件，仅允许defaultOptions 中存在的字段
 * @param {object} defaultOptions 默认的选项
 * @param {object} targetOptions 配置选项
 * @return {object} filterOptions 过滤后的结果
 */
function extendFilterDefaultOption(defaultOptions, targetOptions) {
  const temp = _.cloneDeep(defaultOptions);
  const filterOptions = _.pickBy(targetOptions, (value, key) => {
    return !_.isUndefined(temp[key]);
  });

  return _.assign(temp, filterOptions);
}

/**
 * 扩展基础的 swagger 属性
 * @param  {object} config 配置
 * @return {object} filter config 配置
 */
function extendBase(config) {
  return extendFilterDefaultOption(swaggerTemplate.baseRoot, config);
}

/**
 * 创建 tag item 配置
 * 可以缺省 name
 * @param {object} config config
 * @param {Object} Model model
 * @return {Object} filter object json
 */
function buildTagItem(config, Model) {
  const cloneConfig = _.cloneDeep(config);
  if (!cloneConfig.name && Model) {
    cloneConfig.name = Model.name && Model.name.toLowerCase();
  }
  return extendFilterDefaultOption(swaggerTemplate.defaultTagItem, cloneConfig);
}

function buildPathWithVerb(remoteConfig, methodName, ModelName) {
  const config = _.cloneDeep(remoteConfig);
  // 补全未能直接写入的属性
  if (!config.tags) {
    config.tags = [ ModelName ];
  }

  if (!config.parameters && config.accepts) {
    const acceptsArr = Array.isArray(config.accepts) ? config.accepts : [ config.accepts ];
    const parameters = acceptsArr.map(item => {
      const schema = schemaBuildFromAccept(item);
      const typeAndFormat = buildTypeAndFormat(item);

      const parameter = {
        in: turnParamType2In(remoteConfig.http, item),
        name: item.name || item.arg,
        description: item.description,
        required: !!item.required,
      };

      if (schema) {
        parameter.schema = schema;
      }

      if (typeAndFormat.type) {
        parameter.type = typeAndFormat.type;
      }
      if (typeAndFormat.format) {
        parameter.format = typeAndFormat.format;
      }

      return parameter;
    });

    config.parameters = parameters;
  }

  if (!config.responses && config.returns) {
    const responses = returnsBuildFromAccept(config.returns);
    config.responses = responses;
  }

  if (!config.operationId) {
    config.operationId = createUniqueOperationId(ModelName, methodName, remoteConfig);
  }

  return extendFilterDefaultOption(swaggerTemplate.defaultPathVerbItem, config);
}


function buildDefinitionWithModel(config, Model) {
  let extConfig = config;
  if (Model && Model.createDefinition && typeof Model.createDefinition === 'function') {
    const def = Model.createDefinition();
    if (typeof def === 'object') {
      extConfig = def;
    }
  }
  return extendFilterDefaultOption(swaggerTemplate.defaultDefinitionItem, extConfig);
}

function buildTagWithModel(config, modelName) {
  const tagItem = {
    name: modelName,
    description: config.description,
  };
  return tagItem;
}

/**
 * 获取 swagger json
 * @return {object} json
 */
function getSwagger() {
  const clone = _.cloneDeep(swaggerRoot);
  return clone;
}

/**
 * 初始化 swagger json 配置
 * 处理单个 Model
 * @param  {object} Model Model 对象
 */
function initItemModel(Model) {
  const modelName = Model.name.toLowerCase();
  const config = Model.setting;
  const remotes = Model.remotes;

  const tags = swaggerRoot.tags;
  const paths = swaggerRoot.paths;
  const definitions = swaggerRoot.definitions;

  // 构建 tags
  const currentTag = buildTagWithModel(config, modelName);

  // 构建 Definitions
  const currentDefinition = buildDefinitionWithModel(config, Model);

  // 构建 paths
  const modelPlural = config.plural || `${modelName}s`; // 这里不做复杂的复数转换
  const currentPaths = {};

  const verbMap = {
    get: 'get',
    del: 'delete',
    post: 'post',
    put: 'put',
  };

  _.each(remotes, (remote, key) => {
    const path = remote.http && remote.http.path;
    const verb = remote.http && remote.http.verb || 'get';

    const fullPath = _.trimEnd(convertPathFragments(`/${modelPlural}${path}`), '/');
    if (!currentPaths[fullPath]) {
      currentPaths[fullPath] = {};
    }
    currentPaths[fullPath][verbMap[verb]] = buildPathWithVerb(remote, key, modelName);
  });
  // unique include

  tags.push(currentTag);
  definitions[modelName] = currentDefinition;
  _.assign(paths, currentPaths);
}

/**
 * 初始化 swagger json 配置项目
 * @param  {object} baseConfig 基础配置
 * @param  {[object]} Models Model 数组
 * @return {object} json
 */
function init(baseConfig, Models) {
  reset();
  const base = extendBase(baseConfig);
  Models.forEach(Model => initItemModel(Model));

  _.assign(swaggerRoot, base);

  return swaggerRoot;
}


function reset() {
  swaggerRoot = {
    tags: [],
    paths: {},
    definitions: {},
    securityDefinitions: {},
  };
}

module.exports = {
  turnParamType2In,
  extendBase,
  getSwagger,
  init,
  reset,
  buildDefinitionWithModel,
  initItemModel,
  buildPathWithVerb,
  returnsBuildFromAccept,
  buildTagWithModel,
  buildTagItem,
};
