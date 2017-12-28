'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');
// const cookie = require('cookie');
const { initUsers,
  initArticles,
  initRoles,
  initRoleMappings } = require('./mock/access-remote/data');

describe('test/access-remote.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mm.app({
      baseDir: 'apps/access-remote',
    });
    await app.ready();
    ctx = app.mockContext();
    await ctx.model.User.sync({ force: true });
    await ctx.model.Role.sync({ force: true });
    await ctx.model.Article.sync({ force: true });
    await ctx.model.RoleMapping.sync({ force: true });

    // 录入测试数据
    await ctx.model.User.bulkCreate(initUsers);
    await ctx.model.Role.bulkCreate(initRoles);
    await ctx.model.Article.bulkCreate(initArticles);
    await ctx.model.RoleMapping.bulkCreate(initRoleMappings);
  });

  after(() => app.close());
  afterEach(mm.restore);

  describe('without token access', () => {
    it('401 authorization ERROR GET /api/v1/users', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get('/api/v1/users');

      assert.equal(401, res.status);
    });

    it('200 should GET /api/v1/articles', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get('/api/v1/articles')
        .expect(200);

      assert.equal(3, res.body.length);
    });

    it('401 authorization ERROR GET /api/v1/articles/1', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get('/api/v1/articles/1');

      assert.equal(401, res.status);
    });
  });

  describe.skip('with user1 token access', () => {
    const token = 1;
    it('200 should GET /api/v1/articles', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.length);
    });

    it('200 should GET /api/v1/articles/1', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/1?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(initArticles[0], res.body);
    });

    it('401 authorization ERROR /api/v1/articles/2', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/1?_token=${token}`);

      assert.equal(401, res.status);
    });
  });

  describe.skip('with user2 token access', () => {
    const token = 2;
    it('200 should GET /api/v1/articles', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.length);
    });

    it('200 should GET /api/v1/articles/1', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/1?_token=${token}`);

      assert.equal(401, res.status);
    });

    it('401 authorization ERROR /api/v1/articles/2', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/2?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(initArticles[1], res.body);
    });
  });

  describe.skip('with userAdmin token access', () => {
    const token = 3;
    it('200 should GET /api/v1/articles', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.length);
    });

    it('200 should GET /api/v1/articles/1', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/1?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(initArticles[0], res.body);
    });

    it('200 should GET /api/v1/articles/2', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/2?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(initArticles[1], res.body);
    });
  });

});
