'use strict';
const debug = require('debug')('egg-connector-remote:apps:access-remote:role');

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

  Role._isInRole = async function isInRole(ctx, acl, rule, curProperty, model, modelId) {
    // console.log('in Role');
    // console.log(rule.principalId);
    // console.log(curProperty);
    // mock userId; 正确的方式是从 seesion 中提取,或者在 token 中查找

    const userId = ctx.query._token;
    const inSystem = [ Role.OWNER, Role.AUTHENTICATED, Role.UNAUTHENTICATED, Role.EVERYONE ].some(item => item === rule.principalId);

    debug('inSystem %s', inSystem);
    debug('current acl %o', acl);
    debug('current rule %o', rule);

    if (inSystem) {
      const resolver = Role.resolvers[rule.principalId];
      const result = await resolver(ctx, userId, model, modelId);
      debug('inSystem %s ,userId %s, result %s', rule.principalId, userId, result);
      return result && acl;
    }
    // 自定义 role
    let isMatch = false;
    try {
      const roleInstance = await Role.findOne({ where: { name: rule.principalId } });
      const roleMapping = await app.model.RoleMapping.findOne({ where: { roleId: roleInstance.id, principalId: userId } });
      isMatch = roleInstance && roleMapping;
    } catch (e) {
      isMatch = false;
    }

    debug('custom role isMatch: %s', isMatch);

    return isMatch && acl;
  };

  // Special roles
  Role.OWNER = '$owner'; // owner of the object
  Role.RELATED = '$related'; // any User with a relationship to the object
  Role.AUTHENTICATED = '$authenticated'; // authenticated user
  Role.UNAUTHENTICATED = '$unauthenticated'; // authenticated user
  Role.EVERYONE = '$everyone'; // everyone

  Role.registerResolver = function(role, resolver) {
    if (!Role.resolvers) {
      Role.resolvers = {};
    }
    Role.resolvers[role] = resolver;
  };

  Role.registerResolver(Role.OWNER, async (ctx, userId, modelName, modelId) => {
    debug('in registerResolver');
    if (!modelName || !modelId || !userId) {
      return false;
    }
    const Model = app.model.models[modelName];

    if (Model.BelongOwnerById && typeof Model.BelongOwnerById === 'function') {
      debug('userId %s, model %s', userId, modelId);

      const isMatch = await Model.BelongOwnerById(userId, modelId);
      debug('isMatch %s', isMatch);

      return isMatch;
    }
    return false;
  });


  // Role.isOwner = async function isOwner(modelName, modelId, userId, ) {
  //
  // };
  Role.registerResolver(Role.AUTHENTICATED, async (ctx, userId) => {
    return !!userId;
  });

  Role.registerResolver(Role.UNAUTHENTICATED, async (ctx, userId) => {
    return !userId;
  });

  Role.registerResolver(Role.EVERYONE, async () => {
    return true;
  });

  return Role;
};
