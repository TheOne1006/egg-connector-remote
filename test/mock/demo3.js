'use strict';

class Demo {}
Demo.settings = {
  description: 'demo for init',
};

Demo.remotes = {
  index: {
    description: '从数据源中找到与筛选器匹配的所有实例.',
    isStatic: true,
    accepts: [
      {
        arg: 'filter',
        type: 'object',
        description: '过滤定义 fields, where, include, order, offset, 以及 limit',
      },
    ],
    returns: { arg: 'data', type: 'array', model: 'demo', root: true },
    http: { verb: 'get', path: '/' },
  },
  create: {
    summary: '创建模型的一个新实例并将其持久化到数据库中.',
    accessType: 'WRITE',
    isStatic: true,
    accepts: {
      arg: 'data', type: 'object', model: 'demo',
      description: 'Model 实例数据',
      required: true,
      http: { source: 'body' } },
    returns: { arg: 'data', type: 'object', model: 'demo', root: true },
    http: { verb: 'post', path: '/' },
  },
  destroy: {
    aliases: [ 'destroyById', 'removeById' ],
    summary: '通过 {{id}} 获取 Model 实例 并将其从数据源中删除.',
    accepts: { arg: 'id', type: 'integer', description: 'Model id', required: true,
      http: { source: 'path' } },
    http: { verb: 'del', path: '/:id' },
    returns: { arg: 'count', type: 'object', root: true },
  },
  count: {
    summary: '统计 Model 实例数量可以使用, 可以使用 where 参数.',
    isStatic: true,
    accepts: {
      arg: 'where',
      type: 'object',
      description: 'where 条件',
    },
    returns: { arg: 'count', type: 'number' },
    http: { verb: 'get', path: '/count' },
  },
};

class Foo {}
Foo.settings = {
  description: 'foo for init',
};

Foo.remotes = {
  index: {
    summary: '从数据源中找到与筛选器匹配的所有实例.',
    isStatic: true,
    accepts: [
      {
        arg: 'filter',
        type: 'object',
        description: '过滤定义 fields, where, include, order, offset, 以及 limit',
      },
    ],
    returns: { arg: 'data', type: 'array', model: 'foo', root: true },
    http: { verb: 'get', path: '/' },
  },
  custom: {
    summary: 'test function for .',
    accepts: [
      {
        arg: 'id',
        type: 'number',
        description: 'Model id',
        http: { source: 'path' },
        required: true,
      },
    ],
    returns: { arg: 'data', type: 'object', model: 'foo', root: true },
    http: { verb: 'get', path: '/:id' },
  },
};

Foo.createDefinition = () => {
  return {
    type: 'object',
    description: 'desc from foo',
    properties: {
      config: {
        type: 'string',
      },
    },
    required: [ 'config' ],
  };
};

const expectedRoot = {
  swagger: '2.0', // swagger api version
  info: {
    description: 'desc',
    version: '2.0',
    title: 'title of info',
    termsOfService: '',
    contact: {
      email: '',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  host: 'theone.io',
  basePath: '/v1',
  schemes: [ 'http' ],
  securityDefinitions: {},
  tags: [
    {
      name: 'demo',
      description: 'demo for init',
    },
    {
      name: 'foo',
      description: 'foo for init',
    },
  ],
  definitions: {
    demo: {
      type: 'object',
      description: 'demo for init',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    foo: {
      type: 'object',
      description: 'desc from foo',
      properties: {
        config: {
          type: 'string',
        },
      },
      required: [ 'config' ],
      additionalProperties: false,
    },
  },
  paths: {
    '/demos': {
      get: {
        tags: [ 'demo' ],
        summary: '',
        description: '从数据源中找到与筛选器匹配的所有实例.',
        operationId: 'demo__index__get__',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'query',
          name: 'filter',
          description: '过滤定义 fields, where, include, order, offset, 以及 limit',
          required: false,
          type: 'string',
          format: 'JSON',
        }],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              type: 'array',
              items: {
                $ref: '#/definitions/demo',
              },
            },
          },
        },
        security: [],
        deprecated: false,
      },
      post: {
        tags: [ 'demo' ],
        summary: '创建模型的一个新实例并将其持久化到数据库中.',
        description: '',
        operationId: 'demo__create__post__',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'body',
          name: 'data',
          required: true,
          description: 'Model 实例数据',
          schema: {
            $ref: '#/definitions/demo',
          },
        }],
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
      },
    },
    '/demos/{id}': {
      delete: {
        tags: [ 'demo' ],
        summary: '通过 {{id}} 获取 Model 实例 并将其从数据源中删除.',
        description: '',
        operationId: 'demo.prototype__destroy__del__id',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'path',
          name: 'id',
          required: true,
          type: 'integer',
          format: 'int64',
          description: 'Model id',
        }],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              type: 'object',
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
    '/demos/count': {
      get: {
        tags: [ 'demo' ],
        summary: '统计 Model 实例数量可以使用, 可以使用 where 参数.',
        description: '',
        operationId: 'demo__count__get__count',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'query',
          name: 'where',
          required: false,
          type: 'string',
          format: 'JSON',
          description: 'where 条件',
        }],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              type: 'object',
              properties: {
                count: {
                  type: 'number',
                  format: 'int64',
                },
              },
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
    '/foos': {
      get: {
        tags: [ 'foo' ],
        summary: '从数据源中找到与筛选器匹配的所有实例.',
        description: '',
        operationId: 'foo__index__get__',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'query',
          name: 'filter',
          description: '过滤定义 fields, where, include, order, offset, 以及 limit',
          required: false,
          type: 'string',
          format: 'JSON',
        }],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              type: 'array',
              items: {
                $ref: '#/definitions/foo',
              },
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
    '/foos/{id}': {
      get: {
        tags: [ 'foo' ],
        summary: 'test function for .',
        description: '',
        operationId: 'foo.prototype__custom__get__id',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        parameters: [{
          in: 'path',
          name: 'id',
          required: true,
          type: 'number',
          format: 'int64',
          description: 'Model id',
        }],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              $ref: '#/definitions/foo',
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
  },
};

const initBase = {
  info: {
    description: 'desc',
    version: '2.0',
    title: 'title of info',
    termsOfService: '',
    contact: {
      email: '',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  host: 'theone.io',
  basePath: '/v1',
  schemes: [ 'http' ],
};

module.exports = {
  demoClasses: [ Demo, Foo ],
  initBase,
  expected: expectedRoot,
};
