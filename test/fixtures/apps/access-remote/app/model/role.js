'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const Role = app.model.define('role', {
    name: STRING(30),
    desc: STRING(30),
    userId: INTEGER,
  }, {
    timestamps: false,
  });

  Role.settings = {
    description: 'role description',
  };

  return Role;
};
