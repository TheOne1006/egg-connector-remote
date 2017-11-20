'use strict';

const expected = {
  swagger: '2.0',
  info: {
    title: 'theone.io',
    version: '1.0.0',
    description: 'swagger service description',
  },
  host: 'petstore.swagger.io',
  basePath: '/api/v1',
  schemes: [ 'http' ],
  securityDefinitions: {},
  tags: [
    { name: 'cate', description: 'cate description' },
    { name: 'person', description: 'Person description' },
  ],
  paths: {
    '/cates': {
      get: {
        tags: [ 'cate' ],
        summary: '',
        description: '从数据源中找到与筛选器匹配的所有实例.',
        operationId: 'cate__index__get__',
        produces: [ 'application/json', 'application/xml' ],
        consumes: [ 'application/json', 'application/xml' ],
        parameters: [
          {
            in: 'query',
            name: 'filter',
            description: '过滤定义 fields, where, include, order, offset, 以及 limit',
            required: false,
            type: 'string',
            format: 'JSON',
          },
        ],
        responses: {
          200: {
            description: 'Request was successful',
            type: 'array',
            items: {
              $ref: '#/definitions/cate',
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
    '/cates/{id}': {
      get: {
        tags: [ 'cate' ],
        summary: '',
        description: '从数据源中通过 {{id}} 查找 Model 的实例 .',
        operationId: 'cate.prototype__show__get__id',
        produces: [ 'application/json', 'application/xml' ],
        consumes: [ 'application/json', 'application/xml' ],
        parameters: [
          { in: 'path',
            name: 'id',
            description: 'Model id',
            required: true,
            type: 'string',
          },
          { in: 'query',
            name: 'filter',
            description: '定义 fields(字段) 和 include',
            required: false,
            type: 'string',
            format: 'JSON',
          },
        ],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              $ref: '#/definitions/cate',
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
    '/people/{id}/foo': {
      post: {
        tags: [ 'person' ],
        summary: 'summary for Persion.prototype.foo',
        description: '',
        operationId: 'person.prototype__foo__post__id_foo',
        produces: [ 'application/json', 'application/xml' ],
        consumes: [ 'application/json', 'application/xml' ],
        parameters: [
          { in: 'path',
            name: 'id',
            description: 'Model id',
            required: true,
            type: 'integer',
            format: 'int64',
          },
        ],
        responses: {
          200: {
            description: 'Request was successful',
            schema: {
              $ref: '#/definitions/person',
            },
          },
        },
        security: [],
        deprecated: false,
      },
    },
  },
  definitions: {
    cate: {
      type: 'object',
      description: 'cate description',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    person: {
      type: 'object',
      description: 'Person description',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
};


module.exports = {
  expected,
};
