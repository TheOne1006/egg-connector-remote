'use strict';

const _ = require('lodash');
const SWAGGER_PATH = Symbol('Application#swaggerPath');

// app/extend/application.js
// this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性

function convertPathFragments(path) {
  return path.split('/').map(function(fragment) {
    if (fragment.charAt(0) === ':') {
      return '{' + fragment.slice(1) + '}';
    }
    return fragment;
  }).join('/');
}

function schemaBuildFromAccept(accept) {
  let type = null;

  if (typeof accept === 'string' || typeof accept === 'function') {
    type = accept;
  } else if (Array.isArray(accept)) {
    type = { type: accept };
  }

  if (!accept.type) {
    type = 'any';
  }

  let ldlType = accept.type || type;
  if (accept.type === 'object' && accept.model) {
    ldlType = accept.model;
  }

  const schema = {
  };
  const ldlTypeLowerCase = ldlType.toLowerCase();

  switch (ldlTypeLowerCase) {
    case 'date':
      schema.type = 'string';
      schema.format = 'date';
      break;
    case 'buffer':
      schema.type = 'string';
      schema.format = 'byte';
      break;
    case 'number':
      schema.type = 'number';
      schema.format = schema.format || 'double';
      break;
    case 'any':
      // schema.$ref = '#/definitions/x-any';
      break;
    default:
      schema.$ref = `#/definitions/${ldlTypeLowerCase}`;
  }

  return schema;
}

function convertAcceptsToSwagger(accepts, path, verb) {
  let acceptsArr = accepts;

  const name = accepts.name || accepts.arg;

  if (!Array.isArray(accepts)) {
    acceptsArr = [ accepts ];
  }

  const parameters = acceptsArr.map(item => {
    let paramType = verb.toLowerCase() === 'get' ? 'query' : 'formData';
    if (path.indexOf(':' + name) !== -1) {
      paramType = 'path';
    }

    if (item.http && item.http.source) {
      paramType = item.http.source;
    }

    const schema = schemaBuildFromAccept(item);

    const paramObject = {
      name: item.arg,
      in: paramType,
      description: item.description,
      required: !!item.required,
      type: schema.type ? schema.type : 'string',
      schema,
    };

    if (paramType === 'body') {
      paramObject.type = 'body';
      const isComplexType = schema.type === 'object' ||
                          schema.type === 'array' ||
                          schema.$ref;
      if (isComplexType) {
        paramObject.type = undefined;
        paramObject.format = 'JSON';
      } else {
        _.assign(paramObject, schema);
      }
    }

    return paramObject;
  });

  return parameters;
}

function createUniqueOperationId(model, methodName, verb, path) {
  return methodName + '__' + verb + path.replace(/[\/:]+/g, '_');
}

const verbMap = {
  get: 'get',
  del: 'delete',
  post: 'post',
  put: 'put',
};


const basePath = '/api/v1';

const buildPathInfo = ({ tags,
  summary,
  model,
  methodName,
  verb,
  path,
  parameters,
  responses,
}) => {
  return {
    tags,
    summary: summary || '',
    operationId: createUniqueOperationId(model, methodName, verb, path),
    parameters,
    responses,
    deprecated: false,
  };
};

module.exports = {
  /**
   * 注册 remote
   * @param  {Object} model     数据模型
   * @param  {Object} ctrl      控制器
   * @param  {String} modelName 路径名称
   */
  registerRemote(model, ctrl, modelName) {
    const app = this;
    const remotes = model.remotes;
    const tagName = model.name.toLowerCase();
    const modelPlural = modelName || `${tagName}s`;
    const paths = app.swaggerPath;

    _.each(remotes, (remote, key) => {

    });
  },
};
