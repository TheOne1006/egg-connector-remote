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
            arg: 'offset', type: 'number', description: '偏移量',
            http: { source: 'query' },
          },
          {
            arg: 'limit', type: 'number', description: '显示条数',
            http: { source: 'query' },
          },
          {
            arg: 'data', type: 'object', model: '',
            description: 'Model 实例数据',
            http: { source: 'body' },
          },
        ],
        returns: { arg: 'data', type: 'demo', root: true },
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
            format: 'JSON',
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

  describe('initItemModel()', () => {

  });

  describe('init()', () => {

  });
});
