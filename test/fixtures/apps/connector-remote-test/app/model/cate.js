'use strict';

module.exports = app => {
  const { STRING } = app.Sequelize;
  const Cate = app.model.define('cate', {
    name: STRING(30),
  });

  const typeName = Cate.name;

  Cate.settings = {
    description: 'cate description',
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
        { arg: 'id', type: 'any', description: 'Model id', required: true,
          http: { source: 'path' } },
        { arg: 'filter', type: 'object',
          description: '定义 fields(字段) 和 include' },
      ],
      returns: { arg: 'data', model: typeName, root: true },
      http: { verb: 'get', path: '/:id' },
    },
  };

  return Cate;
};
