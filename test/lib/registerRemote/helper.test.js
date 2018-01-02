'use strict';
const assert = require('assert');
const helper = require('../../../lib/registerRemote/helper');

describe('test/lib/registerRemote/helper.js', () => {
  describe('validateCtxInput()', () => {
    it('catch parameter throw message', () => {
      const mockCtx = {
        params: {
          foo: 'dsa',
          bar: 'dd',
          baz: 'ksd',
          foz: 'dda',
        },
        request: {
          body: '',
        },
        query: '',
      };
      const rules = {
        params: {
          foo: 'jsonString',
          bar: 'numberString',
          baz: 'any',
          foz: 'integerString',
        },
        body: {},
        query: {},
      };

      const block = () => {
        helper.validateCtxInput(mockCtx, rules);
      };

      assert.throws(block, Error);
    });

    it('other Branches throw message', () => {
      const mockCtx = {
        params: '',
        request: {
          body: '',
        },
        query: '',
      };
      const rules = {
        params: {
          foo: 'jsonString',
        },
        body: {},
        query: {},
      };

      const block = () => {
        helper.validateCtxInput(mockCtx, rules);
      };

      assert.throws(block, Error);
    });
  });

  describe('parseArgWithAccept()', () => {
    it('branches 1', () => {
      const mockCtx = {
        params: '',
        request: {
          body: {
            foo: 'demo',
          },
        },
        query: '',
      };

      const accept = {
        arg: 'foo',
        type: 'string',
        http: {
          source: 'body',
        },
      };

      const result = helper.parseArgWithAccept(mockCtx, accept);
      assert.equal('demo', result);

    });

    it('branches 1 body', () => {
      const mockCtx = {
        params: '',
        request: {
          body: {
            foo: { bar: 'demo' },
          },
        },
        query: '',
      };

      const accept = {
        arg: 'foo',
        type: 'object',
        http: {
          source: 'body',
        },
      };

      const result = helper.parseArgWithAccept(mockCtx, accept);
      assert.deepEqual({ bar: 'demo' }, result);

    });
  });
});
