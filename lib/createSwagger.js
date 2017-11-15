'use strict';

const _ = require('lodash');
const swaggerTemplate = require('./swaggerDefault');

// 单例模式

const swaggerRoot = {};


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

function returnsBuildFromAccept(remoteConfig) {
  const responseMessages = {};
  const statusCode = (remoteConfig.returns || remoteConfig.returns.length) ? 200 : 204;
  const tagName = remoteConfig.returns.type || 'any';

  responseMessages[statusCode] = {
    description: 'Request was successful',
    schema: { $ref: `#/definitions/${tagName}` },
  };

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
      const parameter = {
        in: turnParamType2In(remoteConfig.http, item),
        name: item.name || item.arg,
        description: item.description,
        required: !!item.required,
      };

      if (schema) {
        parameter.schema = schema;
      }

      return parameter;
    });

    config.parameters = parameters;
  }

  if (!config.responses && config.returns) {
    const responses = returnsBuildFromAccept(remoteConfig);
    config.responses = responses;
  }

  if (!config.operationId) {
    config.operationId = createUniqueOperationId(ModelName, methodName, remoteConfig);
  }

  return extendFilterDefaultOption(swaggerTemplate.defaultPathVerbItem, config);
}

/**
 * 获取 swagger json
 * @return {object} json
 */
function getSwagger() {
  return swaggerRoot;
}

/**
 * 初始化 swagger json 配置
 * 处理单个 Model
 * @param  {object} Model Model 对象
 * @return {object} json
 */
function initItemModel(Model) {

}

/**
 * 初始化 swagger json 配置项目
 * @param  {[object]} Models Model 数组
 * @return {object} json
 */
function init(Models) {
  return swaggerRoot;
}

module.exports = {
  turnParamType2In,
  extendBase,
  getSwagger,
  init,
  initItemModel,
  buildPathWithVerb,
  buildTagItem,
};
