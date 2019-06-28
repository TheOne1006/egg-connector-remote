'use strict';

class Demo {
}

Demo.remotes = {
  test: {
    summary: 'summary for demo.',
    description: 'description for demo.',
    accepts: [
      {
        arg: 'filter',
        type: 'object',
        description: '过滤定义 fields, where, include, order, offset, 以及 limit',
        http: { source: 'query' },
      },
      {
        arg: 'offset', type: 'integer', description: '偏移量',
        http: { source: 'query' },
      },
      {
        arg: 'limit', type: 'integer', description: '显示条数',
        http: { source: 'query' },
      },
      {
        arg: 'data', type: 'object', model: 'demo',
        description: 'Model 实例数据',
        http: { source: 'body' },
      },
    ],
    returns: { arg: 'data', model: 'demo', root: true },
    http: { verb: 'post', path: '/test' },
  },
};

const expectedPath = {
  tags: [ 'demo' ],
  summary: 'summary for demo.',
  description: 'description for demo.',
  produces: [
    'application/json',
    'application/xml',
    'text/xml',
    'application/javascript',
    'text/javascript',
  ], // 请求格式
  consumes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'application/xml',
    'text/xml',
    'multipart/form-data',
  ], // 响应格式
  operationId: 'demo.prototype__test__post__test',
  parameters: [
    {
      name: 'filter',
      in: 'query',
      description: '过滤定义 fields, where, include, order, offset, 以及 limit',
      required: false,
      type: 'string',
      format: 'JSON',
    },
    {
      name: 'offset',
      in: 'query',
      description: '偏移量',
      required: false,
      type: 'integer',
      format: 'int64',
    },
    {
      name: 'limit',
      in: 'query',
      description: '显示条数',
      required: false,
      type: 'integer',
      format: 'int64',
    },
    {
      name: 'data',
      in: 'body',
      description: 'Model 实例数据',
      required: false,
      schema: {
        $ref: '#/definitions/demo',
      },
    },
  ],
  responses: {
    200: {
      description: 'Request was successful',
      schema: {
        $ref: '#/definitions/demo',
      },
    },
  },
  security: [],
  deprecated: false,
};

module.exports = {
  demoClass: Demo,
  expected: expectedPath,
};
