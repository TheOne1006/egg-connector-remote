'use strict';

const userJSON = require('./user.json');

module.exports = app => {
  const { STRING } = app.Sequelize;
  const User = app.model.define('user', {
    username: STRING(30),
    password: STRING(30),
    desc: STRING(30),
  }, {
    timestamps: false,
  });

  // const typeName = User.name;

  User.settings = userJSON.settings;

  User.index = async function(ctx, filter) {
    return User.findAll(filter);
  };

  User.prototype.show = async function() {
    return this;
  };

  User.exists = async function(ctx, id) {
    const instance = await User.findById(id);
    return { exists: !!instance };
  };

  User.destroyById = async function(ctx, id) {
    const instance = await this.findById(id);
    if (instance) {
      return instance.destroy();
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  User.create = async function(ctx, data) {
    const instance = User.build(data);
    return instance.save();
  };

  User.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    return instance.update(data);
  };

  User.updateAll = async function(ctx, data, where = {}) {
    const [ affectedCount ] = await User.update(data, { where });
    return { affected: affectedCount };
  };

  User.remotes = userJSON.remotes;

  return User;
};
