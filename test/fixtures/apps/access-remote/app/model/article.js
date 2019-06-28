'use strict';
const articleJSON = require('./article.json');

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const Article = app.model.define('article', {
    title: STRING(30),
    desc: STRING(30),
    content: STRING(30),
    userId: INTEGER,
  }, {
    timestamps: false,
  });

  // const typeName = Article.name;

  // 判断是否属于自身
  Article.BelongOwnerById = async function BelongOwnerById(userId, id) {
    const instance = await Article.findOne({ where: { userId, id } });
    return !!instance;
  };

  Article.settings = articleJSON.settings;

  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  Article.errorModelNotFound = function(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  };


  Article.index = async function(ctx, filter) {
    return Article.findAll(filter);
  };

  Article.prototype.show = async function() {
    return this;
  };
  Article.countAll = async function(ctx, filter) {
    const count = await Article.count(filter);
    return { count };
  };

  Article.exists = async function(ctx, id) {
    const instance = await Article.findByPk(id);
    return { exists: !!instance };
  };

  Article.destroyById = async function(ctx, id) {
    const instance = await this.findByPk(id);
    if (instance) {
      return instance.destroy();
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  Article.create = async function(ctx, data) {
    const instance = Article.build(data);
    return instance.save();
  };

  Article.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    return instance.update(data);
  };

  Article.updateAll = async function(ctx, data, where = {}) {
    const [ affectedCount ] = await Article.update(data, { where });
    return { affected: affectedCount };
  };

  Article.remotes = articleJSON.remotes;

  return Article;
};
