'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const RoleMapping = app.model.define('roleMapping', {
    principalType: { type: STRING, allowNull: true }, // 角色名称 The principal type, such as user, application, or role
    principalId: { type: STRING, allowNull: true }, // 类型的id 为 user 时为 userId
    roleId: { type: INTEGER, allowNull: true }, // 角色Id
  }, {
    timestamps: false,
  });

  RoleMapping.settings = {
    description: 'roleMapping description',
  };

  return RoleMapping;
};
