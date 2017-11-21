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
  afterEach('clear swagger', () => {
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
      const demoContainer = require('../mock/demo1.js');
      const methodName = 'test';

      const remoteConfig = demoContainer.demoClass.remotes[methodName];

      const targetSwagger = createSwagger.buildPathWithVerb(remoteConfig, methodName, 'demo');
      const expected = demoContainer.expected;
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
    const demoContainer = require('../mock/demo2.js');
    const Demo = demoContainer.demoClass;
    const expected = demoContainer.expected;

    createSwagger.initItemModel(Demo);
    const swagger = createSwagger.getSwagger();

    // console.log(swagger);
    assert.deepEqual(swagger.tags, expected.tags);
    assert.deepEqual(swagger.definitions, expected.definitions);
    // const swaggerPaths = swagger;
    // const expectedPaths = expected;
    // assert.deepEqual(swaggerPaths, expectedPaths);
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

  describe('returnsBuildFromAccept()', () => {
    it('set root true then ignore arg', () => {
      const returnConfig = { arg: 'data', type: 'object', root: true };
      const actual = createSwagger.returnsBuildFromAccept(returnConfig);
      const expected = {
        200: {
          description: 'Request was successful',
          schema: {
            type: 'object',
          },
        },
      };
      assert.deepEqual(actual, expected);
    });

    it('set root false use arg', () => {
      const returnConfig = { arg: 'data', type: 'object', root: false };
      const actual = createSwagger.returnsBuildFromAccept(returnConfig);
      const expected = {
        200: {
          description: 'Request was successful',
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
              },
            },
          },
        },
      };
      assert.deepEqual(actual, expected);
    });

    it('use different base type', () => {
      const returnConfig = { arg: 'data', type: 'string', root: false };
      const actual = createSwagger.returnsBuildFromAccept(returnConfig);
      const expected = {
        200: {
          description: 'Request was successful',
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'string',
              },
            },
          },
        },
      };
      assert.deepEqual(actual, expected);
    });

    it('set model name use sechma', () => {
      const returnConfig = { arg: 'data', type: 'string', model: 'demo', root: false };
      const actual = createSwagger.returnsBuildFromAccept(returnConfig);
      const expected = {
        200: {
          description: 'Request was successful',
          schema: {
            $ref: '#/definitions/demo',
          },
        },
      };
      assert.deepEqual(actual, expected);
    });

    it('set model name and type array use sechma', () => {
      const returnConfig = { arg: 'data', type: 'array', model: 'demo', root: false };
      const actual = createSwagger.returnsBuildFromAccept(returnConfig);
      const expected = {
        200: {
          description: 'Request was successful',
          schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/demo',
            },
          },
        },
      };
      assert.deepEqual(actual, expected);
    });
  });

  describe('init()', () => {
    it('init All Model and build swagger config', () => {
      const demoContainer = require('../mock/demo3.js');
      const demoClasses = demoContainer.demoClasses;
      const initBase = demoContainer.initBase;

      const actual = createSwagger.init(initBase, demoClasses);

      const expected = demoContainer.expected;

      assert.deepEqual(actual, expected);
    });
  });
});
