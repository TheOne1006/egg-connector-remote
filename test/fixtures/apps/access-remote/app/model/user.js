'use strict';

const userJSON = require('./user.json');
const stream = require('stream');

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
    const instance = await User.findByPk(id);
    return { exists: !!instance };
  };

  User.destroyById = async function(ctx, id) {
    const instance = await this.findByPk(id);
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


  User.prototype.uploadFile = async function(ctx, data, file1, file2) {
    let file1IsinstanceOfFileStream = false;
    if (file1 && file1.filename) {
      file1IsinstanceOfFileStream = file1 instanceof stream.Readable;
    }
    let file2IsinstanceOfFileStream = false;
    if (file2 && file2.filename) {
      file2IsinstanceOfFileStream = file2 instanceof stream.Readable;
    }
    const result = {
      file1Name: file1 && file1.filename || '',
      file2Name: file2 && file2.filename || '',
      file1IsinstanceOfFileStream,
      file2IsinstanceOfFileStream,
      data,
      userId: this.id,
    };

    return result;
  };

  User.remotes = userJSON.remotes;

  return User;
};
