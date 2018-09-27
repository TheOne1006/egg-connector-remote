'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');
const cookie = require('cookie');
const path = require('path');

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
    it('401 authorization file GET /api/v1/users', async () => {
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

    it('401 authorization ERROR should /api/v1/articles/count', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get('/api/v1/articles/count');

      assert.equal(401, res.status);
    });
  });

  describe('with user1 token access', () => {
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
      assert.deepEqual(initArticles[0], res.body);
    });

    it('401 authorization ERROR /api/v1/articles/2', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/2?_token=${token}`);

      assert.equal(401, res.status);
    });

    it('200 should /api/v1/articles/count', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/count?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.count);
    });
  });

  describe('with user2 token access', () => {
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
      assert.deepEqual(initArticles[1], res.body);
    });

    it('200 should /api/v1/articles/count', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/count?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.count);
    });
  });

  describe('with userAdmin token access', () => {
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
      assert.deepEqual(initArticles[0], res.body);
    });

    it('200 should GET /api/v1/articles/2', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/2?_token=${token}`);

      assert.equal(200, res.status);
      assert.deepEqual(initArticles[1], res.body);
    });

    it('200 should /api/v1/articles/count', async () => {
      const agent = await request.agent(app.callback());

      const res = await agent
        .get(`/api/v1/articles/count?_token=${token}`);

      assert.equal(200, res.status);
      assert.equal(3, res.body.count);
    });
  });

  describe('with role create_user', () => {

    it('should POST /api/v1/articles withToken 1', async () => {
      const token = 1;
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .post(`/api/v1/articles?_token=${token}`)
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          title: 'title-creater',
          desc: 'desc-creater',
          content: 'content',
        })
        .expect(200);
      const expected = {
        id: 4,
        title: 'title-creater',
        desc: 'desc-creater',
        content: 'content',
      };
      assert.deepEqual(expected, res.body);
    });

    it('should 401 Error when POST /api/v1/articles withToken 2', async () => {
      const token = 2;
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .post(`/api/v1/articles?_token=${token}`)
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          title: 'title-error',
          desc: 'desc-error',
          content: 'content-error',
        });

      assert.equal(401, res.status);
    });

  });

  describe('with role update_user', () => {

    it('should 401 Error when PUT /api/v1/articles withToken 1', async () => {
      const token = 1;
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .put(`/api/v1/articles/3?_token=${token}`)
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          title: 'title-error',
          desc: 'desc-error',
          content: 'content',
        });

      assert.equal(401, res.status);
    });

    it('should PUT /api/v1/articles withToken 2', async () => {
      const token = 2;
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .put(`/api/v1/articles/3?_token=${token}`)
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          title: 'title-update',
          desc: 'desc-update',
          content: 'content-update',
        });

      assert.equal(200, res.status);
      const expected = {
        id: 3,
        title: 'title-update',
        desc: 'desc-update',
        content: 'content-update',
        userId: 1,
      };
      assert.deepEqual(expected, res.body);
    });

  });

  describe('with user upload file', () => {
    it('should upload file when POST /api/v1/users/1/uploadFile withOutToken', async () => {
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;


      const testPng = path.join(__dirname, 'mock/test-png.png');
      const test2Png = path.join(__dirname, 'mock/test-png.2.png');

      // console.log(testPng);
      const res = await agent
        .post(`/api/v1/users/1/uploadFile?_csrf=${csrfToken}`)
        .set('Content-Type', 'multipart/form-data')
        .set('Accept', 'application/json')
        .field('data', '{"test": 123 }')
        .attach('file1', testPng)
        .attach('file2', test2Png);

      assert.equal(200, res.status);

      const matchObj = {
        file1Name: 'test-png.png',
        file2Name: 'test-png.2.png',
        file1IsinstanceOfFileStream: true,
        file2IsinstanceOfFileStream: true,
        userId: 1,
        data: { test: 123 },
      };

      assert.deepEqual(matchObj, res.body);
    });

    it('should without file when POST /api/v1/users/1/uploadFile withOutToken', async () => {
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;


      // console.log(testPng);
      const res = await agent
        .post(`/api/v1/users/1/uploadFile?_csrf=${csrfToken}`)
        .set('Content-Type', 'multipart/form-data')
        .set('Accept', 'application/json')
        .field('data', '{"test": 123 }');

      assert.equal(400, res.status);

      // const matchObj = {
      //   file1Name: 'test-png.png',
      //   file2Name: 'test-png.2.png',
      //   file1IsinstanceOfFileStream: true,
      //   file2IsinstanceOfFileStream: true,
      //   userId: 1,
      //   data: { test: 123 },
      // };

      // assert.deepEqual(matchObj, res.body);
    });
  });


});
