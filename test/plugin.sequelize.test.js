'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const _ = require('lodash');
const createSwagger = require('../lib/createSwagger');

describe('test/plugin.sequelize.test.js', () => {
  let app;
  let ctx;

  before(async () => {
    app = mm.app({
      baseDir: 'apps/connector-remote-test',
    });
    await app.ready();
    ctx = app.mockContext();
    await ctx.model.sync({ force: true });
  });

  after(mm.restore);
  beforeEach('clear swagger', () => {
    createSwagger.reset();
  });
  afterEach('clear swagger', () => {
    createSwagger.reset();
  });

  describe('load Model use egg-sequelize', () => {
    it('model init success', () => {
      assert(app.model);
      const modelArr = _.map(app.model.models, item => item);
      assert(modelArr.length, 2);
    });
  });

  describe('init build swagger use model', () => {
    it('get app.swagger', () => {
      const expected = require('./mock/connector-remote-test').expected;
      assert.deepEqual(app.swagger, expected);
    });
  });

});
