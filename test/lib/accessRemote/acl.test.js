'use strict';
const assert = require('assert');
const ACL = require('../../../lib/accessRemote/acl');

describe('test/lib/registerRemote/helper.js', () => {
  describe('ACL.getMatchingScore()', () => {
    let rule, req;
    beforeEach(() => {
      rule = {
        model: 'article',
        property: [ 'updateAttributes', 'destroyById' ],
        principalType: 'ROLE',
        principalId: 'update_user',
        accessType: 'EXECUTE',
        permission: 'ALLOW',
      };

      req = {
        model: 'article',
        property: 'updateAttributes',
        accessType: 'WRITE',
      };
    });

    it('common get score', () => {
      // const score = ACL.getMatchingScore(rule, req);
      const score = ACL.getMatchingScore(undefined, req);
      assert.equal(5408, score);

      const score2 = ACL.getMatchingScore(rule, req);
      assert.equal(8148, score2);

      rule.property = '*';
      const score3 = ACL.getMatchingScore(rule, req);
      assert.equal(7636, score3);
    });

    it('with error property', () => {
      rule.property = 'error';
      const score4 = ACL.getMatchingScore(rule, req);
      assert.equal(-1, score4);
    });

    it('with different system property', () => {

      rule.principalId = '$owner';
      const score5 = ACL.getMatchingScore(rule, req);
      assert.equal(8144, score5);

      rule.principalId = '$authenticated';
      const score6 = ACL.getMatchingScore(rule, req);
      assert.equal(8136, score6);

      rule.principalId = '$unauthenticated';
      const score7 = ACL.getMatchingScore(rule, req);
      assert.equal(8136, score7);
    });


  });

  describe('checkAccessForContext()', () => {
    it('with empty acl', async () => {
      const isInRoleFunc = () => {};
      const ctx = {};
      const allow = await ACL.checkAccessForContext(isInRoleFunc, ctx);
      assert.equal(true, allow);
    });

    it('with isInRoleFunc throw error', async () => {
      const isInRoleFunc = () => { throw new Error('err'); };
      const ctx = {};
      const allow = await ACL.checkAccessForContext(isInRoleFunc, ctx);
      assert.equal(true, allow);
    });
  });

  describe('getStaticACLs()', () => {
    it('with empty arguments', () => {
      const staticACLs = ACL.getStaticACLs();
      const expected = [];
      assert.deepEqual(expected, staticACLs);
    });
  });
});
