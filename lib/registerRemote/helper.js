'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const Parameter = require('parameter');
const stream = require('stream');

/**
 * 添加字段校验规则
 */
const parameter = new Parameter();
parameter.addRule('jsonString', (rule, value) => {
  if (!value) {
    if (rule.required) return 'must be required';
    return;
  }
  try {
    // https://segmentfault.com/q/1010000008460413/a-1020000008461292
    if (typeof JSON.parse(value) !== 'object') {
      return 'must be json string';
    }
  } catch (err) {
    return 'must be json string';
  }
});
parameter.addRule('arrayString', (rule, value) => {
  if (!value) {
    if (rule.required) return 'must be required';
    return;
  }
  try {
    // https://segmentfault.com/q/1010000008460413/a-1020000008461292
    if (!Array.isArray(JSON.parse(value))) {
      return 'must be array string';
    }
  } catch (err) {
    return 'must be array string';
  }
});
parameter.addRule('numberString', (rule, value) => {
  const result = parseFloat(value);
  if (typeof result !== 'number' || isNaN(result)) {
    return 'must be number string';
  }
});
parameter.addRule('any', () => { });
parameter.addRule('integerString', (rule, value) => {
  const result = parseInt(value, 10);
  if (!_.isFinite(result) || isNaN(result)) {
    return 'must be integer string';
  }
});
parameter.addRule('file', (rule, value) => {
  if (!value) {
    if (rule.required) return 'must be required';
    return;
  }
  if (!(value instanceof stream.Readable)) {
    return 'must be file stream';
  }
});

function tranArgType(type, inBody) {
  if (type === 'object' && !inBody) {
    return 'jsonString';
  } else if (type === 'number' && !inBody) {
    return 'numberString';
  } else if (type === 'integer' && !inBody) {
    return 'integerString';
  } else if (type === 'array' && !inBody) {
    return 'arrayString';
  }
  return type;
}

function tarnAccepts2ValidateConfig(typeAccepts, isBody = false) {
  const isRoot = typeAccepts[0] && typeAccepts[0].root;
  if (isRoot) {
    const rootItem = typeAccepts[0];
    return {
      type: tranArgType(rootItem.type, isBody),
      required: rootItem.required || false,
    };
  }

  return typeAccepts.reduce((config, currentItem) => {
    config[currentItem.arg] = {
      type: tranArgType(currentItem.type, isBody),
      required: currentItem.required || false,
    };
    if (currentItem.type === 'string') {
      config[currentItem.arg].allowEmpty = true;
    }
    return config;
  }, {});
}

/**
 * 解析 accepts 成为 validate config
 * @param {Array/Object} accepts accepts配置
 * @return {Object} {{path, body, query}}
 */
function parseAcceptsToArgs(accepts) {
  const cloneAccepts = _.cloneDeep(accepts);
  const acceptsArr = Array.isArray(cloneAccepts) ? cloneAccepts : [ cloneAccepts ];
  const paramsAccepts = [];
  const queryAccepts = [];
  const bodyAccepts = [];
  const formDataAccepts = [];

  // console.log(accepts);
  acceptsArr.forEach(item => {
    if (item.http && item.http.source === 'body') {
      bodyAccepts.push(item);
    } else if (item.http && item.http.source === 'path') {
      paramsAccepts.push(item);
    } else if (item.http && item.http.source === 'formData') {
      formDataAccepts.push(item);
    } else {
      queryAccepts.push(item);
    }
  });

  return {
    params: tarnAccepts2ValidateConfig(paramsAccepts),
    body: tarnAccepts2ValidateConfig(bodyAccepts, true),
    query: tarnAccepts2ValidateConfig(queryAccepts),
    formData: tarnAccepts2ValidateConfig(formDataAccepts),
  };
}

async function validateCtxInput(ctx, validateConfigs) {
  const params = ctx.params || {};
  const body = ctx.request.body || {};
  const query = ctx.query || {};

  const pathsError = parameter.validate(validateConfigs.params, params);
  const bodyError = !_.isEmpty(validateConfigs.body) && parameter.validate({ body: validateConfigs.body }, { body }); // 支持 root 参数
  const queryError = parameter.validate(validateConfigs.query, query);


  // 不需要 则 不加载
  let formDataError;
  if (!_.isEmpty(validateConfigs.formData)) {
    const formData = await ctx.getFormData() || {};
    formDataError = parameter.validate(validateConfigs.formData, formData);
  }

  if (pathsError || bodyError || queryError || formDataError) {

    const firstError = (pathsError || bodyError || queryError || formDataError)[0];
    const error = new Error('Validate Error');
    error.message = `${firstError.code} value for argument '${firstError.field}' ${firstError.message}`;
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }

  return true;
}

async function parseArgWithAccept(ctx, accept) {
  // const isQuery = !accept.http || accept.http.source === 'query'; // default
  const isPath = accept.http && accept.http.source === 'path';
  const isBody = accept.http && accept.http.source === 'body';
  const isFormData = accept.http && accept.http.source === 'formData';
  const isRoot = accept.root;

  const type = accept.type;
  const argName = accept.arg;
  let source = ctx.query;
  let result;

  if (isBody) {
    source = ctx.request.body;
  } else if (isPath) {
    source = ctx.params;
  } else if (isFormData) {

    const createSource = await ctx.getFormData();

    source = createSource;
  }

  switch (type) {
    case 'object':
    case 'array':
      // 这里负责解析，不负责校验
      result = !isBody ? (source[argName] && JSON.parse(source[argName])) : (isRoot ? source : source && source[argName]);
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

async function parseCtxInput(ctx, accepts, isStatic) {
  const cloneAccepts = _.cloneDeep(accepts);
  const acceptsArr = Array.isArray(cloneAccepts) ? cloneAccepts : [ cloneAccepts ];
  const filterAcceptsArr = acceptsArr.filter(item => {
    if (isStatic) return true;
    if (item.http && item.http.source === 'path' && item.arg === 'id') return false;
    return true;
  });

  // return filterAcceptsArr.map(accept => parseArgWithAccept(ctx, accept));

  return Promise.mapSeries(filterAcceptsArr, async accept => parseArgWithAccept(ctx, accept));
}

exports.parseAcceptsToArgs = parseAcceptsToArgs;
exports.tranArgType = tranArgType;
exports.tarnAccepts2ValidateConfig = tarnAccepts2ValidateConfig;
exports.validateCtxInput = validateCtxInput;
exports.parseArgWithAccept = parseArgWithAccept;
exports.parseCtxInput = parseCtxInput;
