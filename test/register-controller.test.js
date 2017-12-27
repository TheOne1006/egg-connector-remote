'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');
const demo1 = {
  id: 1,
  name: 'demo',
};
const demo2 = {
  id: 2,
  name: 'demo2',
};
const demo3 = {
  id: 3,
  name: 'demo3',
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
        };

        assert.deepEqual(expected, res.body);
      });
  });

  it('should POST /api/v1/cates', () => {
    return request(app.callback())
      .post('/api/v1/cates')
      .send({
        name: 'post',
      })
      .expect(200)
      .then(res => {
        const expected = {
          id: 4,
          name: 'post',
        };
        assert.deepEqual(expected, res.body);
      });
  });
});
