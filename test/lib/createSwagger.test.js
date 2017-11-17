'use strict';
const assert = require('assert');
const createSwagger = require('../../lib/createSwagger');
const swaggerTemplate = require('../../lib/swaggerDefault');

describe('test/lib/createSwagger.js', () => {
  let baseRoot;
  let defaultTagItem;
  before(() => {
    defaultTagItem = swaggerTemplate.defaultTagItem;
    baseRoot = swaggerTemplate.baseRoot;
  });
  beforeEach(() => {
    createSwagger.reset();
  });
  describe('extendBase()', () => {
    it('just return config filter other keys', () => {
      const errorConfig = {
        error: 'error',
        other: {
          ignore: 'ignore',
        },
      };
      const targetSwagger = createSwagger.extendBase(errorConfig);
      const expected = baseRoot;
      assert.deepEqual(targetSwagger, expected);
    });

    it('return a config with custom', () => {
      const config = {
        swagger: '1.5',
        info: {
          description: 'desc',
          version: '',
        },
        host: 'theone.io',
        error: 'error',
      };

      const expected = {
        swagger: '1.5',
        info: {
          description: 'desc',
          version: '',
        },
        host: 'theone.io',
        basePath: '/v1',
        schemes: [ 'http' ],
      };
      const targetSwagger = createSwagger.extendBase(config);
      assert.deepEqual(targetSwagger, expected);
    });
  });

  describe('buildTagItem()', () => {
    it('just return defualt config with error argument', () => {
      const errorConfig = {
        error: 'error',
        val: {
          other: 'other',
        },
      };
      const targetSwagger = createSwagger.buildTagItem(errorConfig);
      const expected = defaultTagItem;
      assert.deepEqual(targetSwagger, expected);
    });

    it('just cover custom config with argument different Class', () => {
      const config = {
        name: 'demo',
        externalDocs: {
          description: 'demo for external',
        },
      };
      class Demo1 {}
      const targetSwagger = createSwagger.buildTagItem(config, Demo1);
      const expected = {
        name: 'demo',
        description: '',
        externalDocs: {
          description: 'demo for external',
        },
      };
      assert.deepEqual(targetSwagger, expected);
    });

    it('just cover custom config with argument ignore config.name', () => {
      const config = {
        externalDocs: {
          description: 'demo for external',
        },
      };
      class Demo {}
      const targetSwagger = createSwagger.buildTagItem(config, Demo);
      const expected = {
        name: 'demo',
        description: '',
        externalDocs: {
          description: 'demo for external',
        },
      };
      assert.deepEqual(targetSwagger, expected);
    });
  });

  describe('buildPathWithVerb()', () => {
    it('create path item from remoteConfig', () => {
      const remoteConfig = {
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
      };

      const methodName = 'test';
      const targetSwagger = createSwagger.buildPathWithVerb(remoteConfig, methodName, 'demo');
      const expected = {
        tags: [ 'demo' ],
        summary: 'summary for demo.',
        description: 'description for demo.',
        produces: [ 'application/json', 'application/xml' ], // 请求格式
        consumes: [ 'application/json', 'application/xml' ], // 响应格式
        operationId: `demo.prototype__${methodName}__post__test`,
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
      assert.deepEqual(targetSwagger, expected);
    });
  });

  describe('buildDefinitionWithModel()', () => {
    it('create definition from Model config withOut Model.createDefinition', () => {
      class Demo {}
      const config = {
        description: 'desc',
        properties: {
          path: {
            type: 'string',
          },
        },
        required: [ 'path' ],
        additionalProperties: false,
      };
      const targetSwagger = createSwagger.buildDefinitionWithModel(config, Demo);

      const expected = {
        type: 'object',
        description: 'desc',
        properties: {
          path: {
            type: 'string',
          },
        },
        required: [ 'path' ],
        additionalProperties: false,
      };
      assert.deepEqual(targetSwagger, expected);
    });

    it('create definition from Model config with Model.createDefinition', () => {
      class Demo {}
      Demo.createDefinition = () => {
        return {
          type: 'object',
          description: 'desc from description',
          properties: {
            config: {
              type: 'string',
            },
          },
          required: [ 'config' ],
        };
      };
      const config = {
        description: 'desc',
        required: [ 'path' ],
      };

      const targetSwagger = createSwagger.buildDefinitionWithModel(config, Demo);

      const expected = {
        type: 'object',
        description: 'desc from description',
        required: [ 'config' ],
        properties: {
          config: {
            type: 'string',
          },
        },
        additionalProperties: false,
      };
      assert.deepEqual(targetSwagger, expected);
    });
  });

  describe('initItemModel()', () => {
    class Demo {}
    Demo.setting = {
      description: 'demo for initItemModel',
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

    createSwagger.initItemModel(Demo);
    const swagger = createSwagger.getSwagger();

    const expected = {
      tags: [
        {
          name: 'demo',
          description: 'demo for initItemModel',
        },
      ],
      definitions: {
        demo: {
          type: 'object',
          description: 'demo for initItemModel',
          properties: {},
          required: [],
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
                type: 'array',
                items: {
                  $ref: '#/definitions/demo',
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
      },
    };

    // console.log(swagger);
    assert.deepEqual(swagger.tags, expected.tags);
    assert.deepEqual(swagger.definitions, expected.definitions);
    const swaggerPaths = swagger.paths;
    const expectedPaths = expected.paths;
    assert.deepEqual(swaggerPaths, expectedPaths);
    assert.deepEqual(swagger, expected);

    // console.log(expectedInfo);
    // console.log(expectedInfo);
    // assert.deepEqual(swaggerInfo.tags, expectedInfo.tags);
    // assert.deepEqual(swaggerInfo.summary, expectedInfo.summary);
    // assert.deepEqual(swaggerInfo.description, expectedInfo.description);
    // assert.deepEqual(swaggerInfo.operationId, expectedInfo.operationId);
    // assert.deepEqual(swaggerInfo.produces, expectedInfo.produces);
    // assert.deepEqual(swaggerInfo.parameters, expectedInfo.parameters);
    // assert.deepEqual(swaggerInfo.consumes, expectedInfo.consumes);
    // assert.deepEqual(swaggerInfo.responses, expectedInfo.responses);
    // assert.deepEqual(swaggerInfo.security, expectedInfo.security);
    // assert.deepEqual(swaggerInfo.deprecated, expectedInfo.deprecated);
    // assert.deepEqual(swaggerPaths, expectedPaths);

    // assert.deepEqual(swagger, expected, 'un match');
  });

  describe('init()', () => {

  });
});
