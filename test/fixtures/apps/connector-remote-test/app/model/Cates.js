'use strict';

class Cate {

}
const typeName = Cate.name;

Cate.remotes = {
  index: {
    description: '从数据源中找到与筛选器匹配的所有实例.',
    accepts: [
      {
        arg: 'filter',
        type: 'object',
        description: '过滤定义 fields, where, include, order, offset, 以及 limit',
      },
      {
        arg: 'offset', type: 'number', description: '偏移量',
        http: { source: 'query' },
      },
      {
        arg: 'limit', type: 'number', description: '显示条数',
        http: { source: 'query' },
      },
    ],
    returns: { arg: 'data', type: typeName, root: true },
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
    returns: { arg: 'data', type: typeName, root: true },
    http: { verb: 'get', path: '/:id' },
  },
};

module.exports = Cate;
