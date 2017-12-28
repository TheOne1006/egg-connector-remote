'use strict';

const Promise = require('bluebird');
const debug = require('debug')('egg-connector-remote:accessContext:acl');

/**
 * Access Control List
 * 访问控制列表
 */

class ACL {
  static async checkAccessForContext(ctx, isInRoleFunc, modelName, acls = [], curProperty = '') {
    debug('check access in path: %s', ctx.path);
    const staticACLs = ACL.getStaticACLs(modelName, acls, curProperty);
    const inRoleTasks = staticACLs
      .filter(acl => acl.principalType === ACL.ROLE)
      .map(acl => isInRoleFunc(ctx, acl));

    await Promise.map(inRoleTasks, task => task());



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

ACL.ROLE = 'ROLE'
ACL.APP = 'APP'
ACL.USER = 'USER'
