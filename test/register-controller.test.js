'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');
const cookie = require('cookie');

const demo1 = {
  id: 1,
  name: 'demo',
  desc: null,
};
const demo2 = {
  id: 2,
  name: 'put',
  desc: null,
};
const demo3 = {
  id: 3,
  name: 'del',
  desc: null,
};


describe('test/register-controller.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mm.app({
      baseDir: 'apps/register-controller',
    });
    await app.ready();
    ctx = app.mockContext();
    await ctx.model.Cate.sync({ force: true });

    // 录入测试数据
    await ctx.model.Cate.bulkCreate([
      demo1,
      demo2,
      demo3,
    ]);
  });

  after(() => app.close());
  afterEach(mm.restore);

  it('should GET /api/v1/cates', () => {
    return request(app.callback())
      .get('/api/v1/cates')
      .expect(200)
      .then(res => {
        const expected = [
          demo1,
          demo2,
          demo3,
        ];
        assert.deepEqual(expected, res.body);
      });
  });

  it('should error GET /api/v1/cates?filter=123', () => {
    request(app.callback())
      .get('/api/v1/cates?filter=123')
      .then(res => {
        assert.equal(400, res.status);
      });
  });

  it('should GET /api/v1/cates?filter={"where":{"id": "1"}}', () => {
    return request(app.callback())
      .get('/api/v1/cates?filter={"where":{"id": "1"}}')
      .expect(200)
      .then(res => {
        const expected = [
          demo1,
        ];
        assert.deepEqual(expected, res.body);
      });
  });

  it('should GET /api/v1/cates/1', () => {
    return request(app.callback())
      .get('/api/v1/cates/1')
      .expect(200)
      .then(function(res) {
        const expected = {
          id: 1,
          name: 'demo',
          desc: null,
        };

        assert.deepEqual(expected, res.body);
      });
  });

  describe('post', () => {
    it('should POST /api/v1/cates', async () => {
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .post('/api/v1/cates')
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          name: 'post',
        })
        .expect(200);
      const expected = {
        id: 4,
        name: 'post',
      };
      assert.deepEqual(expected, res.body);
    });
  });

  describe('put', () => {
    it('should PUT /api/v1/cates/2', async () => {
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);
      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .put('/api/v1/cates/2')
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          name: 'newput',
        })
        .expect(200);
      const expected = {
        id: 2,
        name: 'newput',
        desc: null,
      };
      assert.deepEqual(expected, res.body);
    });

    it('should PUT /api/v1/cates', async () => {
      const agent = await request.agent(app.callback());

      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);

      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      const res = await agent
        .put('/api/v1/cates?where={"id":{"$gt":2}}')
        .set('content-type', 'application/json')
        .send({
          _csrf: csrfToken,
          desc: 'update all desc',
        })
        .expect(200);
      const expected = {
        affected: 2,
      };
      assert.deepEqual(expected, res.body);
    });
  });

  describe('del', () => {
    it('should DEL /api/v1/cates/3', async () => {
      const agent = await request.agent(app.callback());
      const preRes = await agent
        .get('/')
        .set('accept', 'text/html')
        .expect(200);

      const cookieObj = cookie.parse(preRes.header['set-cookie'][0]);
      const csrfToken = cookieObj.csrfToken;

      await agent
        .del(`/api/v1/cates/3?_csrf=${csrfToken}`)
        .set('content-type', 'application/json')
        .expect(200);

      const existRes = await agent
        .get('/api/v1/cates/exists/3');

      const expected = {
        exists: false,
      };
      assert.deepEqual(expected, existRes.body);
    });
  });

});
