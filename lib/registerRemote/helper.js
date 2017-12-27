'use strict';

const _ = require('lodash');

const Parameter = require('parameter');

/**
 * 添加字段校验规则
 */
const parameter = new Parameter();
parameter.addRule('jsonString', (rule, value) => {
  try {
    // https://segmentfault.com/q/1010000008460413/a-1020000008461292
    if (typeof JSON.parse(value) !== 'object') {
      return 'must be json string';
    }
  } catch (err) {
    return 'must be json string';
  }
});
parameter.addRule('numberString', (rule, value) => {
  if (!_.isNumber(parseFloat(value))) {
    return 'must be number string';
  }
});
parameter.addRule('any', () => {});
parameter.addRule('integerString', (rule, value) => {
  if (!_.isFinite(parseInt(value, 10))) {
    return 'must be number string';
  }
});

function tranArgType(type, inBody) {
  if (type === 'object' && !inBody) {
    return 'jsonString';
  } else if (type === 'number' && !inBody) {
    return 'numberString';
  } else if (type === 'integer' && !inBody) {
    return 'integerString';
  }
  return type;
}

function tarnAccepts2ValidateConfig(typeAccepts, isBody = false) {
  return typeAccepts.reduce((config, currentItem) => {
    config[currentItem.arg] = {
      type: tranArgType(currentItem.type, isBody),
      required: currentItem.required || false,
    };
    return config;
  }, {});
}

/**
 * 解析 accepts 成为 validate config
 * @param accepts
 * @returns {{path, body, query}}
 */
function parseAcceptsToArgs(accepts) {
  const cloneAccepts = _.cloneDeep(accepts);
  const acceptsArr = Array.isArray(cloneAccepts) ? cloneAccepts : [ cloneAccepts ];
  const paramsAccepts = [];
  const queryAccepts = [];
  const bodyAccepts = [];

  // console.log(accepts);
  acceptsArr.forEach(item => {
    if (item.http && item.http.source === 'body') {
      bodyAccepts.push(item);
    } else if (item.http && item.http.source === 'path') {
      paramsAccepts.push(item);
    } else {
      queryAccepts.push(item);
    }
  });

  return {
    params: tarnAccepts2ValidateConfig(paramsAccepts),
    body: tarnAccepts2ValidateConfig(bodyAccepts, true),
    query: tarnAccepts2ValidateConfig(queryAccepts),
  };
}

function validateCtxInput(ctx, validateConfigs) {
  const params = ctx.params || {};
  const body = ctx.body || {};
  const query = ctx.query || {};

  const pathsError = parameter.validate(validateConfigs.params, params);
  const bodyError = parameter.validate(validateConfigs.body, body);
  const queryError = parameter.validate(validateConfigs.query, query);

  if (pathsError || bodyError || queryError) {
    const firstError = (pathsError || bodyError || queryError)[0];
    const error = new Error('Validate Error');
    error.message = `${firstError.code} value for argument '${firstError.field}' ${firstError.message}`;
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }
}

function parseArgWithAccept(ctx, accept) {
  // const isQuery = !accept.http || accept.http.source === 'query'; // default
  const isPath = accept.http && accept.http.source === 'path';
  const isBody = accept.http && accept.http.source === 'body';
  const isRoot = accept.root;

  const type = accept.type;
  const argName = accept.arg;
  const source = isBody ? ctx.body : (isPath ? ctx.params : ctx.query);
  let result;

  switch (type) {
    case 'object':
      // 这里负责解析，不负责校验
      result = !isBody ? (source[argName] && JSON.parse(source[argName])) : (isRoot ? source : source[argName]);
      break;
    case 'number':
      result = parseFloat(source[argName]);
      break;
    case 'integer':
      result = parseInt(source[argName], 10);
      break;
    default:
      result = source[argName];
      break;
  }
  return result;
}

function parseCtxInput(ctx, accepts) {
  const cloneAccepts = _.cloneDeep(accepts);
  const acceptsArr = Array.isArray(cloneAccepts) ? cloneAccepts : [ cloneAccepts ];
  return acceptsArr.map(accept => parseArgWithAccept(ctx, accept));
}

exports.parseAcceptsToArgs = parseAcceptsToArgs;
exports.tranArgType = tranArgType;
exports.tarnAccepts2ValidateConfig = tarnAccepts2ValidateConfig;
exports.validateCtxInput = validateCtxInput;
exports.parseArgWithAccept = parseArgWithAccept;
exports.parseCtxInput = parseCtxInput;
