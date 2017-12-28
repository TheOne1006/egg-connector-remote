'use strict';

const Promise = require('bluebird');
const debug = require('debug')('egg-connector-remote:accessContext:acl');

/**
 * Access Control List
 * 访问控制列表
 */

class ACL {

  /**
   * Resolve permission from the ACLs
   * @param  {Array}  [acls=[]] [description]
   * @return {[type]}           [description]
   */
  static resolvePermission(acls = []) {

    return {};
  }

  /**
   * 计算规则得分
   * @param  {Object} [rule={}] [description]
   * @param  {Object} [req={}] AccessRequest
   * @return {Number} score 规则得分
   */
  static getMatchingScore(rule = {}, req) {
    const props = [ 'model', 'property', 'accessType' ];
    let score = 0;

    for (let i = 0; i < props.length; i++) {
      // Shift the score by 4 for each of the properties as the weight
      score = score * 4;
      const ruleValue = rule[props[i]] || ACL.ALL;
      const requestedValue = req[props[i]] || ACL.ALL;
      const isMatchingMethodName = props[i] === 'property' && req.property === props[i];

      let isMatchingAccessType = ruleValue === requestedValue;
      if (props[i] === 'accessType' && !isMatchingAccessType) {
        switch (ruleValue) {
          case ACL.EXECUTE:
            // EXECUTE should match READ, REPLICATE and WRITE
            isMatchingAccessType = true;
            break;
          case ACL.WRITE:
            // WRITE should match REPLICATE too
            isMatchingAccessType = requestedValue === ACL.REPLICATE;
            break;
          default:
            break;
        }
      }

      if (isMatchingMethodName || isMatchingAccessType) {
        // Exact match
        score += 3;
      } else if (ruleValue === ACL.ALL) {
        // Wildcard match
        score += 2;
      } else if (requestedValue === ACL.ALL) {
        score += 1;
      } else {
        // Doesn't match at all
        return -1;
      }
    }

    // Weigh against the principal type into 4 levels
    // - user level (explicitly allow/deny a given user)
    // - app level (explicitly allow/deny a given app)
    // - role level (role based authorization)
    // - other
    // user > app > role > ...
    score = score * 4;
    switch (rule.principalType) {
      case ACL.USER:
        score += 4;
        break;
      case ACL.APP:
        score += 3;
        break;
      case ACL.ROLE:
        score += 2;
        break;
      default:
        score += 1;
    }

    // Weigh against the roles
    // everyone < authenticated/unauthenticated < related < owner < ...
    score = score * 8;
    if (rule.principalType === ACL.ROLE) {
      switch (rule.principalId) {
        case '$owner': // XXX:hack
          score += 4;
          break;
        case '$related':
          score += 3;
          break;
        case '$authenticated':
        case '$unauthenticated':
          score += 2;
          break;
        case '$everyone':
          score += 1;
          break;
        default:
          score += 5;
      }
    }
    score = score * 4;
    score += ACL.permissionOrder[rule.permission || ACL.ALLOW] - 1;

    return score;
  }
  static async checkAccessForContext(isInRoleFunc, ctx, modelName, acls = [], curProperty = '') {
    debug('check access in path: %s', ctx.path);
    const staticACLs = ACL.getStaticACLs(modelName, acls, curProperty);
    const matchRoleACLs = staticACLs
      .filter(acl => acl.principalType === ACL.ROLE);

    const effectiveACLs = await Promise.map(matchRoleACLs, async acl => await isInRoleFunc(ctx, acl));
    console.log(effectiveACLs);

  }
  /**
   * Get the static ACLs from the model definition
   * 只接受 Model.settings 的配置
   * @param  {String} [ModelName = '']   ModelName
   * @param  {Array}  [acls=[]]     Model.settings.acls
   * @param  {String} [property=''] property The property/method/relation name
   * @return {[type]}               @return {Object[]} An array of ACLs
   */
  static getStaticACLs(ModelName = '', acls = [], property = '') {

    const filterMatchACls = acls.fileter(acl => {
      const propertys = Array.isArray(acl.property) ? acl.property : [ acl.property ];
      // * or match in array
      return acl.property === ACL.ALL || propertys.same(item => item === property);
    });

    const staticACLs = filterMatchACls.map(acl => (new ACL({
      ModelName,
      property: acl.property || ACL.ALL,
      principalType: acl.principalType,
      principalId: acl.principalId,
      accessType: acl.accessType || ACL.ALL,
      permission: acl.permission,
    })));

    // Loopback acl 允许额外通过 数据库配置

    return staticACLs;
  }
}

// Define constants for access types
ACL.ALL = '*';

ACL.READ = 'READ'; // Read operation
ACL.REPLICATE = 'REPLICATE'; // Replicate (pull) changes
ACL.WRITE = 'WRITE'; // Write operation
ACL.EXECUTE = 'EXECUTE'; // Execute operation

ACL.DEFAULT = 'DEFAULT'; // Not specified
ACL.ALLOW = 'ALLOW'; // Allow
ACL.ALARM = 'ALARM'; // Warn - send an alarm
ACL.AUDIT = 'AUDIT'; // Audit - record the access
ACL.DENY = 'DENY'; // Deny

ACL.ROLE = 'ROLE';
ACL.APP = 'APP';
ACL.USER = 'USER';

ACL.permissionOrder = {
  DEFAULT: 0,
  ALLOW: 1,
  ALARM: 2,
  AUDIT: 3,
  DENY: 4,
};
