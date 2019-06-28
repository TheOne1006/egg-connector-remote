'use strict';

module.exports = app => {
  const { STRING } = app.Sequelize;
  const Cate = app.model.define('cate', {
    name: STRING(30),
    desc: STRING(30),
  }, {
    timestamps: false,
  });

  const typeName = Cate.name;

  Cate.settings = {
    description: 'cate description',
  };

  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  Cate.errorModelNotFound = function(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  };


  Cate.index = async function(ctx, filter) {
    return Cate.findAll(filter);
  };

  Cate.prototype.show = async function() {
    return this;
  };

  Cate.exists = async function(ctx, id) {
    const instance = await Cate.findByPk(id);
    return { exists: !!instance };
  };

  Cate.destroyById = async function(ctx, id) {
    const instance = await this.findByPk(id);
    if (instance) {
      return instance.destroy();
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  Cate.create = async function(ctx, data) {
    const instance = Cate.build(data);
    return instance.save();
  };

  Cate.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    return instance.update(data);
  };

  Cate.updateAll = async function(ctx, data, where = {}) {
    const [ affectedCount ] = await Cate.update(data, { where });
    return { affected: affectedCount };
  };

  Cate.remotes = {
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
      returns: { arg: 'data', type: 'array', model: typeName, root: true },
      http: { verb: 'get', path: '/' },
    },
    show: {
      description: '从数据源中通过 {{id}} 查找 Model 的实例 .',
      accepts: [
        { arg: 'id', type: 'number', description: 'Model id', required: true,
          http: { source: 'path' } },
        { arg: 'filter', type: 'object',
          description: '定义 fields(字段) 和 include' },
      ],
      returns: { arg: 'data', model: typeName, type: 'object', root: true },
      http: { verb: 'get', path: '/:id' },
    },
    create: {
      summary: '创建模型的一个新实例并将其持久化到数据库中.',
      accessType: 'WRITE',
      isStatic: true,
      accepts: {
        arg: 'data', type: 'object', model: typeName,
        description: 'Model 实例数据',
        root: true,
        http: { source: 'body' } },
      returns: { arg: 'data', model: typeName, type: 'object', root: true },
      http: { verb: 'post', path: '/' },
    },
    updateAttributes: {
      summary: '更新模型实例的属性并将其持久化到数据源中.',
      accessType: 'WRITE',
      isStatic: false,
      accepts: [
        {
          arg: 'data', type: 'object', model: typeName, root: true,
          http: { source: 'body' },
          description: '模型属性名称/值对的对象',
        },
        { arg: 'id', type: 'integer', description: 'Model id', required: true,
          http: { source: 'path' },
        },
      ],
      returns: { arg: 'data', model: typeName, type: 'object', root: true },
      http: { verb: 'put', path: '/:id' },
    },
    destroyById: {
      aliases: [ 'destroy', 'removeById' ],
      isStatic: true,
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
    exists: {
      summary: '通过 {{id}} 获取 Model 实例 是否存在.',
      isStatic: true,
      accepts: { arg: 'id', type: 'integer', description: 'Model id', required: true,
        http: { source: 'path' } },
      http: { verb: 'get', path: '/exists/:id' },
      returns: { arg: 'exists', type: 'bool' },
    },
    updateAll: {
      summary: '批量更新Model 所有实例',
      isStatic: true,
      accepts: [{
        arg: 'data',
        type: 'object',
        description: 'Model 需要更新的数据',
        http: { source: 'body' },
        root: true,
      }, {
        arg: 'where',
        type: 'object',
        description: 'where 条件',
        http: { source: 'query' },
      }],
      http: { verb: 'put', path: '/' },
      returns: { arg: 'affectedRows', type: 'object' },
    },
  };

  return Cate;
};
